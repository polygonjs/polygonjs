/**
 * Allows to detect when the mouse hovers over an object
 *
 */
import {TypedEventNode} from './_Base';
import {CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {VisibleIfParamOptions, ParamOptions} from '../../params/utils/OptionsController';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {RaycastCPUController} from './utils/raycast/CPUController';
import {CPUIntersectWith, CPU_INTERSECT_WITH_OPTIONS} from './utils/raycast/CpuConstants';
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
	options['intersectWith'] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY);
	return {visibleIf: options};
}
function visible_for_cpu_plane(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.CPU);
	options['intersectWith'] = CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.PLANE);
	return {visibleIf: options};
}
function visible_for_gpu(options: VisibleIfParamOptions = {}): ParamOptions {
	options['mode'] = RAYCAST_MODES.indexOf(RaycastMode.GPU);
	return {visibleIf: options};
}

export enum TargetType {
	SCENE_GRAPH = 'scene graph',
	NODE = 'node',
}
export const TARGET_TYPES: TargetType[] = [TargetType.SCENE_GRAPH, TargetType.NODE];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Poly} from '../../Poly';

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
	overrideCamera = ParamConfig.BOOLEAN(0, visible_for_cpu());
	/** @param by default the ray is sent from the current camera, but this allows to set a custom ray */
	overrideRay = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			mode: RAYCAST_MODES.indexOf(RaycastMode.CPU),
			overrideCamera: 1,
		},
	});
	/** @param the camera to override to */
	camera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: CAMERA_TYPES,
		},
		dependentOnFoundNode: false,
		...visible_for_cpu({
			overrideCamera: 1,
			overrideRay: 0,
		}),
	});
	/** @param the ray origin */
	rayOrigin = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {
			overrideCamera: 1,
			overrideRay: 1,
		},
	});
	/** @param the ray direction */
	rayDirection = ParamConfig.VECTOR3([0, 0, 1], {
		visibleIf: {
			overrideCamera: 1,
			overrideRay: 1,
		},
	});

	//
	//
	// GPU
	//
	//
	/** @param the material to use on the scene for GPU detection */
	overrideMaterial = ParamConfig.BOOLEAN(0, visible_for_gpu());
	/** @param the material to use on the scene for GPU detection */
	material = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		computeOnDirty: true,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastGPUController.PARAM_CALLBACK_update_material(node as RaycastEventNode);
		},
		...visible_for_gpu({overrideMaterial: 1}),
	});
	/** @param the current pixel color being read */
	pixelColor = ParamConfig.COLOR([0, 0, 0], {
		cook: false,
		...visible_for_gpu(),
	});
	pixelAlpha = ParamConfig.FLOAT(0, {
		range: [0, 1],
		cook: false,
		...visible_for_gpu(),
	});
	/** @param the value threshold for which a hit is detected */
	hitThreshold = ParamConfig.FLOAT(0.5, {
		cook: false,
		...visible_for_gpu(),
	});

	//
	//
	// CPU
	//
	//
	/** @param defines the hit it tested against geometry or just a plane */
	intersectWith = ParamConfig.INTEGER(CPU_INTERSECT_WITH_OPTIONS.indexOf(CPUIntersectWith.GEOMETRY), {
		menu: {
			entries: CPU_INTERSECT_WITH_OPTIONS.map((name, value) => {
				return {name, value};
			}),
		},
		...visible_for_cpu(),
	});
	/** @param threshold used to test hit with points */
	pointsThreshold = ParamConfig.FLOAT(1, {
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
	planeDirection = ParamConfig.VECTOR3([0, 1, 0], {
		...visible_for_cpu_plane(),
	});
	/** @param plane offset if the hit is tested against a plane */
	planeOffset = ParamConfig.FLOAT(0, {
		...visible_for_cpu_plane(),
	});

	//
	//
	// CPU GEOMETRY
	//
	//
	targetType = ParamConfig.INTEGER(0, {
		menu: {
			entries: TARGET_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
		...visible_for_cpu_geometry(),
	});
	/** @param node whose objects to test hit against, when testing against geometries */
	targetNode = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
		dependentOnFoundNode: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry({targetType: TARGET_TYPES.indexOf(TargetType.NODE)}),
	});
	/** @param objects to test hit against, when testing against geometries */
	objectMask = ParamConfig.STRING('*geo1*', {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry({targetType: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)}),
	});
	/** @param prints which objects are targeted by this node, for debugging */
	printFoundObjectsFromMask = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_print_resolve(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry({targetType: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)}),
	});
	/** @param toggle to hit if tested against children */
	traverseChildren = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			RaycastCPUController.PARAM_CALLBACK_update_target(node as RaycastEventNode);
		},
		...visible_for_cpu_geometry(),
		separatorAfter: true,
	});

	//
	//
	// POSITION (common between plane and geo intersection)
	//
	//
	/** @param toggle on to update hit position */
	tposition = ParamConfig.BOOLEAN(1, {
		cook: false,
		...visible_for_cpu(),
	});
	/** @param toggle on to set the param to the hit position */
	tpositionTarget = ParamConfig.BOOLEAN(0, {
		cook: false,
		...visible_for_cpu({tposition: 1}),
	});
	/** @param this will be set to the hit position */
	position = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		...visible_for_cpu({tposition: 1, tpositionTarget: 0}),
	});
	/** @param this parameter will be set to the hit position */
	positionTarget = ParamConfig.PARAM_PATH('', {
		// positionTarget param should not be dependent
		// on found Param, otherwise, as soon as the target param is change,
		// this param would have to cook
		dependentOnFoundParam: false,
		cook: false,
		...visible_for_cpu({tposition: 1, tpositionTarget: 1}),
		paramSelection: ParamType.VECTOR3,
		computeOnDirty: true,
	});
	/** @param toggle on to set the param to the mouse velocity (experimental) */
	tvelocity = ParamConfig.BOOLEAN(0, {
		cook: false,
		...visible_for_cpu(),
		// callback: (node: BaseNodeType, param: BaseParamType) => {
		// 	RaycastCPUVelocityController.PARAM_CALLBACK_update_timer(node as RaycastEventNode);
		// },
	});
	/** @param toggle on to set the param to the mouse velocity */
	tvelocityTarget = ParamConfig.BOOLEAN(0, {
		cook: false,
		...visible_for_cpu({tvelocity: 1}),
	});
	/** @param this will be set to the mouse velocity */
	velocity = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		...visible_for_cpu({tvelocity: 1, tvelocityTarget: 0}),
	});
	/** @param this will be set to the mouse velocity */
	velocityTarget = ParamConfig.PARAM_PATH('', {
		dependentOnFoundParam: false,
		cook: false,
		...visible_for_cpu({tvelocity: 1, tvelocityTarget: 1}),
		paramSelection: ParamType.VECTOR3,
		computeOnDirty: true,
	});
	//
	//
	// GEO ATTRIB
	//
	//
	/** @param for geometry hit tests, a vertex attribute can be read */
	geoAttribute = ParamConfig.BOOLEAN(0, visible_for_cpu_geometry());
	/** @param geometry vertex attribute to read */
	geoAttributeName = ParamConfig.STRING('id', {
		cook: false,
		...visible_for_cpu_geometry({geoAttribute: 1}),
	});
	/** @param type of attribute */
	geoAttributeType = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
		...visible_for_cpu_geometry({geoAttribute: 1}),
	});
	/** @param attribute value for float */
	geoAttributeValue1 = ParamConfig.FLOAT(0, {
		cook: false,
		...visible_for_cpu_geometry({
			geoAttribute: 1,
			geoAttributeType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		}),
	});
	/** @param attribute value for string */
	geoAttributeValues = ParamConfig.STRING('', {
		...visible_for_cpu_geometry({
			geoAttribute: 1,
			geoAttributeType: ATTRIBUTE_TYPES.indexOf(AttribType.STRING),
		}),
	});
}
const ParamsConfig = new RaycastParamsConfig();

export class RaycastEventNode extends TypedEventNode<RaycastParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return 'raycast';
	}
	static readonly INPUT_TRIGGER = 'trigger';
	static readonly INPUT_MOUSE = 'mouse';
	static readonly INPUT_UPDATE_OBJECTS = 'updateObjects';
	static readonly INPUT_TRIGGER_VEL_RESET = 'triggerVelReset';
	static readonly OUTPUT_HIT = 'hit';
	static readonly OUTPUT_MISS = 'miss';

	public readonly cpuController: RaycastCPUController = new RaycastCPUController(this);
	public readonly gpuController: RaycastGPUController = new RaycastGPUController(this);

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				RaycastEventNode.INPUT_TRIGGER,
				EventConnectionPointType.BASE,
				this._processTriggerEventThrottled.bind(this)
			),
			new EventConnectionPoint(
				RaycastEventNode.INPUT_MOUSE,
				EventConnectionPointType.MOUSE,
				this._processMouseEvent.bind(this)
			),
			new EventConnectionPoint(
				RaycastEventNode.INPUT_UPDATE_OBJECTS,
				EventConnectionPointType.BASE,
				this._process_trigger_update_objects.bind(this)
			),
			new EventConnectionPoint(
				RaycastEventNode.INPUT_TRIGGER_VEL_RESET,
				EventConnectionPointType.BASE,
				this._process_trigger_vel_reset.bind(this)
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(RaycastEventNode.OUTPUT_HIT, EventConnectionPointType.BASE),
			new EventConnectionPoint(RaycastEventNode.OUTPUT_MISS, EventConnectionPointType.BASE),
		]);
	}

	triggerHit(context: EventContext<MouseEvent>) {
		this.dispatchEventToOutput(RaycastEventNode.OUTPUT_HIT, context);
	}
	triggerMiss(context: EventContext<MouseEvent>) {
		this.dispatchEventToOutput(RaycastEventNode.OUTPUT_MISS, context);
	}

	private _processMouseEvent(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpuController.updateMouse(context);
		} else {
			this.gpuController.updateMouse(context);
		}
	}

	private _lastEventProcessedAt = -1;
	private _processTriggerEventThrottled(context: EventContext<MouseEvent>) {
		const now = Poly.performance.performanceManager().now();
		const getDelta = (now: number) => {
			const previous = this._lastEventProcessedAt;
			const delta = now - previous;
			return delta;
		};
		const delta = getDelta(now);
		if (delta < TIMESTAMP) {
			setTimeout(() => {
				const delta = getDelta(now);
				if (delta < TIMESTAMP) {
					this._processTriggerEvent(context);
				}
			}, TIMESTAMP - delta);
		} else {
			this._processTriggerEvent(context);
		}
	}
	private _processTriggerEvent(context: EventContext<MouseEvent>) {
		this._processMouseEvent(context);
		this._lastEventProcessedAt = Poly.performance.performanceManager().now();
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpuController.processEvent(context);
		} else {
			this.gpuController.processEvent(context);
		}
	}

	private _process_trigger_update_objects(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpuController.update_target();
		}
	}

	private _process_trigger_vel_reset(context: EventContext<MouseEvent>) {
		if (this.pv.mode == RAYCAST_MODES.indexOf(RaycastMode.CPU)) {
			this.cpuController.velocity_controller.reset();
		}
	}
}
