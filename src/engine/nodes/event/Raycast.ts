import {TypedEventNode} from './_Base';
import {NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {VisibleIfParamOptions, ParamOptions} from '../../params/utils/OptionsController';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {RaycastCPUController, CPU_INTERSECT_WITH_OPTIONS, CPUIntersectWith} from './utils/raycast/CPUController';
import {RaycastGPUController} from './utils/raycast/GPUController';

enum RaycastMode {
	CPU = 'cpu',
	GPU = 'gpu',
}
const RAYCAST_MODES: Array<RaycastMode> = [RaycastMode.CPU, RaycastMode.GPU];

function visible_for_cpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	return {visible_if: options};
}
function visible_for_cpu_geometry(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	options['intersect_with'] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY);
	return {visible_if: options};
}
function visible_for_cpu_plane(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	options['intersect_with'] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.PLANE);
	return {visible_if: options};
}
function visible_for_gpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.GPU);
	return {visible_if: options};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {ParamType} from '../../poly/ParamType';

const OUTPUT_HIT = 'hit';
const OUTPUT_MISS = 'miss';

class RaycastParamsConfig extends NodeParamsConfig {
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
	mouse = ParamConfig.VECTOR2([0, 0], {cook: false});
	override_camera = ParamConfig.BOOLEAN(0);
	override_ray = ParamConfig.BOOLEAN(0, {
		visible_if: {
			mode: RAYCAST_MODES.indexOf(RaycastMode.CPU),
			override_camera: 1,
		},
	});
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
		dependent_on_found_node: false,
		visible_if: {
			override_camera: 1,
			override_ray: 0,
		},
	});
	ray_origin = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {
			override_camera: 1,
			override_ray: 1,
		},
	});
	ray_direction = ParamConfig.VECTOR3([0, 0, 1], {
		visible_if: {
			override_camera: 1,
			override_ray: 1,
		},
	});

	//
	//
	// GPU
	//
	//
	material = ParamConfig.OPERATOR_PATH('/MAT/mesh_basic_builder1', {
		node_selection: {
			context: NodeContext.MAT,
		},
		dependent_on_found_node: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastGPUController.PARAM_CALLBACK_update_material(node as RaycastEventNode);
		},
		...visible_for_gpu(),
	});
	pixel_value = ParamConfig.VECTOR4([0, 0, 0, 0], {
		cook: false,
		...visible_for_gpu(),
	});
	hit_threshold = ParamConfig.FLOAT(0.5, {
		cook: false,
		...visible_for_gpu(),
	});

	//
	//
	// CPU
	//
	//
	intersect_with = ParamConfig.INTEGER(CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY), {
		menu: {
			entries: CPU_INTERSECT_WITH_OPTIONS.map((name, value) => {
				return {name, value};
			}),
		},
		...visible_for_cpu(),
	});
	//
	//
	// CPU PLANE
	//
	//
	plane_direction = ParamConfig.VECTOR3([0, 1, 0], {
		...visible_for_cpu_plane(),
	});
	plane_offset = ParamConfig.FLOAT(0, {
		...visible_for_cpu_plane(),
	});

	//
	//
	// CPU GEOMETRY
	//
	//
	target = ParamConfig.OPERATOR_PATH('/geo1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
		dependent_on_found_node: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry(),
	});
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
	tposition_target = ParamConfig.BOOLEAN(0, {
		cook: false,
		...visible_for_cpu(),
	});
	position = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		...visible_for_cpu({tposition_target: 0}),
	});
	position_target = ParamConfig.OPERATOR_PATH('', {
		cook: false,
		...visible_for_cpu({tposition_target: 1}),
		param_selection: ParamType.VECTOR3,
		compute_on_dirty: true,
	});
	//
	//
	// GEO ATTRIB
	//
	//
	geo_attribute = ParamConfig.BOOLEAN(0, visible_for_cpu_geometry());
	geo_attribute_name = ParamConfig.STRING('id', {
		cook: false,
		...visible_for_cpu_geometry({geo_attribute: 1}),
	});
	geo_attribute_value = ParamConfig.FLOAT(0, {
		cook: false,
		...visible_for_cpu_geometry({geo_attribute: 1}),
	});
}
const ParamsConfig = new RaycastParamsConfig();

export class RaycastEventNode extends TypedEventNode<RaycastParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'raycast';
	}

	public readonly cpu_controller: RaycastCPUController = new RaycastCPUController(this);
	public readonly gpu_controller: RaycastGPUController = new RaycastGPUController(this);

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE, this._process_trigger_event.bind(this)),
			new EventConnectionPoint('mouse', EventConnectionPointType.MOUSE, this._process_mouse_event.bind(this)),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_HIT, EventConnectionPointType.BASE),
			new EventConnectionPoint(OUTPUT_MISS, EventConnectionPointType.BASE),
		]);
	}

	trigger_hit() {
		this.dispatch_event_to_output(OUTPUT_HIT, {});
	}
	trigger_miss() {
		this.dispatch_event_to_output(OUTPUT_MISS, {});
	}

	private _process_mouse_event(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpu_controller.update_mouse(context);
		} else {
			this.gpu_controller.update_mouse(context);
		}
	}

	private _process_trigger_event(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpu_controller.process_event(context);
		} else {
			this.gpu_controller.process_event(context);
		}
	}
}
