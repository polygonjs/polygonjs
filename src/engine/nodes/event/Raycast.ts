/**
 * Allows to detect when the mouse hovers over an object
 *
 */
import {TypedEventNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {VisibleIfParamOptions, ParamOptions} from '../../params/utils/OptionsController';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {RaycastCPUController, CPU_INTERSECT_WITH_OPTIONS, CPUIntersectWith} from './utils/raycast/CPUController';
import {RaycastGPUController} from './utils/raycast/GPUController';
import {AttribType, ATTRIBUTE_TYPES, AttribTypeMenuEntries} from '../../../core/geometry/Constant';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ParamType} from '../../poly/ParamType';

const TIMESTAMP = 1000.0 / 60.0;

enum RaycastMode {
	CPU = 'cpu',
	GPU = 'gpu',
}
const RAYCAST_MODES: Array<RaycastMode> = [RaycastMode.CPU, RaycastMode.GPU];

function visible_for_cpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	return {visibleIf: options};
}
function visible_for_cpu_geometry(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	options['intersect_with'] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY);
	return {visibleIf: options};
}
function visible_for_cpu_plane(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	options['intersect_with'] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.PLANE);
	return {visibleIf: options};
}
function visible_for_gpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.GPU);
	return {visibleIf: options};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class RaycastParamsConfig extends NodeParamsConfig {
	/** @param defines if the ray detection is done on the CPU or GPU (GPU being currently experimental) */
	mode = ParamConfig.INTEGER(RAYCAST_MODES.indexOf(RaycastMode.CPU), {
		menu: {
			entries: RAYCAST_MODES.map((name, value) => {
				return {
					name,
					value,
				};
			}),
		},
	});
	//
	//
	// COMMON
	//
	//
	/** @param mouse coordinates (0,0) being the center of the screen, (-1,-1) being the bottom left corner and (1,1) being the top right corner */
	mouse = ParamConfig.VECTOR2([0, 0], {cook: false});
	/** @param by default the ray is sent from the current camera, but this allows to set another camera */
	override_camera = ParamConfig.BOOLEAN(0);
	/** @param by default the ray is sent from the current camera, but this allows to set a custom ray */
	override_ray = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			mode: RAYCAST_MODES.indexOf(RaycastMode.CPU),
			override_camera: 1,
		},
	});
	/** @param the camera to override to */
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
		dependentOnFoundNode: false,
		visibleIf: {
			override_camera: 1,
			override_ray: 0,
		},
	});
	/** @param the ray origin */
	ray_origin = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {
			override_camera: 1,
			override_ray: 1,
		},
	});
	/** @param the ray direction */
	ray_direction = ParamConfig.VECTOR3([0, 0, 1], {
		visibleIf: {
			override_camera: 1,
			override_ray: 1,
		},
	});

	//
	//
	// GPU
	//
	//
	/** @param the material to use on the scene for GPU detection */
	material = ParamConfig.OPERATOR_PATH('/MAT/mesh_basic_builder1', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastGPUController.PARAM_CALLBACK_update_material(node as RaycastEventNode);
		},
		...visible_for_gpu(),
	});
	/** @param the current pixel value being read */
	pixel_value = ParamConfig.VECTOR4([0, 0, 0, 0], {
		cook: false,
		...visible_for_gpu(),
	});
	/** @param the value threshold for which a hit is detected */
	hit_threshold = ParamConfig.FLOAT(0.5, {
		cook: false,
		...visible_for_gpu(),
	});

	//
	//
	// CPU
	//
	//
	/** @param defines the hit it tested against geometry or just a plane */
	intersect_with = ParamConfig.INTEGER(CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY), {
		menu: {
			entries: CPU_INTERSECT_WITH_OPTIONS.map((name, value) => {
				return {name, value};
			}),
		},
		...visible_for_cpu(),
	});
	/** @param threshold used to test hit with points */
	points_threshold = ParamConfig.FLOAT(1, {
		range: [0, 100],
		rangeLocked: [true, false],
		...visible_for_cpu(),
	});
	//
	//
	// CPU PLANE
	//
	//
	/** @param plane direction if the hit is tested against a plane */
	plane_direction = ParamConfig.VECTOR3([0, 1, 0], {
		...visible_for_cpu_plane(),
	});
	/** @param plane offset if the hit is tested against a plane */
	plane_offset = ParamConfig.FLOAT(0, {
		...visible_for_cpu_plane(),
	});

	//
	//
	// CPU GEOMETRY
	//
	//
	/** @param objects to test hit against, when testing against geometries */
	target = ParamConfig.OPERATOR_PATH('/geo1', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
		dependentOnFoundNode: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry(),
	});
	/** @param toggle to hit is tested against children */
	traverse_children = ParamConfig.BOOLEAN(0, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry(),
	});
	sep = ParamConfig.SEPARATOR(null, {
		...visible_for_cpu_geometry(),
	});

	//
	//
	// POSITION (common between plane and geo intersection)
	//
	//
	/** @param toggle on to set the param to the hit position */
	tposition_target = ParamConfig.BOOLEAN(0, {
		cook: false,
		...visible_for_cpu(),
	});
	/** @param this will be set to the hit position */
	position = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		...visible_for_cpu({tposition_target: 0}),
	});
	/** @param this parameter will be set to the hit position */
	position_target = ParamConfig.OPERATOR_PATH('', {
		cook: false,
		...visible_for_cpu({tposition_target: 1}),
		paramSelection: ParamType.VECTOR3,
		computeOnDirty: true,
	});
	/** @param toggle on to set the param to the mouse velocity (experimental) */
	tvelocity = ParamConfig.BOOLEAN(0, {
		cook: false,
		// callback: (node: BaseNodeType, param: BaseParamType) => {
		// 	RaycastCPUVelocityController.PARAM_CALLBACK_update_timer(node as RaycastEventNode);
		// },
	});
	/** @param toggle on to set the param to the mouse velocity */
	tvelocity_target = ParamConfig.BOOLEAN(0, {
		cook: false,
		...visible_for_cpu({tvelocity: 1}),
	});
	/** @param this will be set to the mouse velocity */
	velocity = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		...visible_for_cpu({tvelocity: 1, tvelocity_target: 0}),
	});
	/** @param this will be set to the mouse velocity */
	velocity_target = ParamConfig.OPERATOR_PATH('', {
		cook: false,
		...visible_for_cpu({tvelocity: 1, tvelocity_target: 1}),
		paramSelection: ParamType.VECTOR3,
		computeOnDirty: true,
	});
	//
	//
	// GEO ATTRIB
	//
	//
	/** @param for geometry hit tests, a vertex attribute can be read */
	geo_attribute = ParamConfig.BOOLEAN(0, visible_for_cpu_geometry());
	/** @param geometry vertex attribute to read */
	geo_attribute_name = ParamConfig.STRING('id', {
		cook: false,
		...visible_for_cpu_geometry({geo_attribute: 1}),
	});
	/** @param type of attribute */
	geo_attribute_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
		...visible_for_cpu_geometry({geo_attribute: 1}),
	});
	/** @param attribute value for float */
	geo_attribute_value1 = ParamConfig.FLOAT(0, {
		cook: false,
		...visible_for_cpu_geometry({
			geo_attribute: 1,
			geo_attribute_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		}),
	});
	/** @param attribute value for string */
	geo_attribute_values = ParamConfig.STRING('', {
		...visible_for_cpu_geometry({
			geo_attribute: 1,
			geo_attribute_type: ATTRIBUTE_TYPES.indexOf(AttribType.STRING),
		}),
	});
}
const ParamsConfig = new RaycastParamsConfig();

export class RaycastEventNode extends TypedEventNode<RaycastParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'raycast';
	}
	static readonly OUTPUT_HIT = 'hit';
	static readonly OUTPUT_MISS = 'miss';

	public readonly cpu_controller: RaycastCPUController = new RaycastCPUController(this);
	public readonly gpu_controller: RaycastGPUController = new RaycastGPUController(this);

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				'trigger',
				EventConnectionPointType.BASE,
				this._process_trigger_event_throttled.bind(this)
			),
			new EventConnectionPoint('mouse', EventConnectionPointType.MOUSE, this._process_mouse_event.bind(this)),
			new EventConnectionPoint(
				'trigger_vel_reset',
				EventConnectionPointType.BASE,
				this._process_trigger_vel_reset.bind(this)
			),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(RaycastEventNode.OUTPUT_HIT, EventConnectionPointType.BASE),
			new EventConnectionPoint(RaycastEventNode.OUTPUT_MISS, EventConnectionPointType.BASE),
		]);
	}

	trigger_hit(context: EventContext<MouseEvent>) {
		this.dispatch_event_to_output(RaycastEventNode.OUTPUT_HIT, context);
	}
	trigger_miss(context: EventContext<MouseEvent>) {
		this.dispatch_event_to_output(RaycastEventNode.OUTPUT_MISS, context);
	}

	private _process_mouse_event(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpu_controller.update_mouse(context);
		} else {
			this.gpu_controller.update_mouse(context);
		}
	}

	private _last_event_processed_at = performance.now();
	private _process_trigger_event_throttled(context: EventContext<MouseEvent>) {
		const previous = this._last_event_processed_at;
		const now = performance.now();
		this._last_event_processed_at = now;
		const delta = now - previous;
		if (delta < TIMESTAMP) {
			setTimeout(() => {
				this._process_trigger_event(context);
			}, TIMESTAMP - delta);
		} else {
			this._process_trigger_event(context);
		}
	}
	private _process_trigger_event(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpu_controller.process_event(context);
		} else {
			this.gpu_controller.process_event(context);
		}
	}

	private _process_trigger_vel_reset(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpu_controller.velocity_controller.reset();
		}
	}
}
