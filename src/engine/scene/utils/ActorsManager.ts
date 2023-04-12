import {Object3D} from 'three';
// import {TypedNode} from '../../nodes/_Base';
// import {BaseActorNodeType} from '../../nodes/actor/_Base';
// import {ActorNodeChildrenMap} from '../../poly/registers/nodes/Actor';
// import {NodeCreateOptions} from '../../nodes/utils/hierarchy/ChildrenController';
// import {
// 	AttribValue,
// 	// Constructor,
// 	//  valueof
// 	} from '../../../types/GlobalTypes';
// import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {PolyScene} from '../PolyScene';
// import {CoreObject} from '../../../core/geometry/Object';
// import {MapUtils} from '../../../core/MapUtils';
import {ActorManualTriggersController} from './actors/ManualTriggersController';
// import {NodeContext} from '../../poly/NodeContext';
// import {ActorPointerEventsController} from './actors/ActorsPointerEventsController';
// import {ActorHoveredEventsController} from './actors/ActorsHoveredEventsController';
import {ActorKeyboardEventsController} from './actors/ActorsKeyboardEventsController';
// import {AttributeProxy} from '../../../core/geometry/attribute/_Base';
// import {OnScenePlayStateActorNode} from '../../nodes/actor/OnScenePlayState';
// import {ActorNodeTriggerContext} from '../../nodes/actor/_Base';
// import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorMethodName, EVALUATOR_METHOD_NAMES} from '../../nodes/js/code/assemblers/actor/Evaluator';
import {ActorEvaluatorGenerator} from '../../nodes/js/code/assemblers/actor/EvaluatorGenerator';
// import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
// import {NodeCreateOptions} from '../../nodes/utils/hierarchy/ChildrenController';
// import {Constructor, valueof} from '../../../types/GlobalTypes';
// import {BaseJsNodeType} from '../../nodes/js/_Base';
import {ActorPointerEventsController} from './actors/ActorsPointerEventsController';
import {AssemblerControllerNode} from '../../nodes/js/code/Controller';
import {JsAssemblerActor} from '../../nodes/js/code/assemblers/actor/ActorAssembler';
import {ActorCompilationController} from '../../../core/actor/ActorCompilationController';
// import { ActorJsSopNode } from '../../nodes/sop/ActorJs';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
// import {EventData} from '../../../core/event/EventData';

const ACTOR_BUILDER_NODE_IDS_KEY = 'actorBuilderNodeIds';

enum EventHandlerType {
	instant = 'instant',
	onTick = 'onTick',
}
const EVENT_MAP_LOGIC: Record<EvaluatorMethodName, EventHandlerType> = {
	[JsType.ON_KEY]: EventHandlerType.onTick,
	[JsType.ON_KEYDOWN]: EventHandlerType.onTick,
	[JsType.ON_KEYPRESS]: EventHandlerType.onTick,
	[JsType.ON_KEYUP]: EventHandlerType.onTick,
	// [JsType.ON_MANUAL_TRIGGER]: EventHandlerType.instant,
	[JsType.ON_MAPBOX_CAMERA_MOVE]: EventHandlerType.onTick,
	[JsType.ON_MAPBOX_CAMERA_MOVE_START]: EventHandlerType.onTick,
	[JsType.ON_MAPBOX_CAMERA_MOVE_END]: EventHandlerType.onTick,
	[JsType.ON_OBJECT_ATTRIBUTE_UPDATE]: EventHandlerType.onTick,
	['onClick']: EventHandlerType.onTick,
	[JsType.ON_OBJECT_DISPATCH_EVENT]: EventHandlerType.instant, // TODO
	['onPointermove']: EventHandlerType.onTick,
	// [JsType.ON_OBJECT_POINTERDOWN]: EventHandlerType.onTick,
	// [JsType.ON_OBJECT_POINTERUP]: EventHandlerType.onTick,
	[JsType.ON_PERFORMANCE_CHANGE]: EventHandlerType.instant,
	[JsType.ON_POINTERDOWN]: EventHandlerType.onTick,
	[JsType.ON_POINTERUP]: EventHandlerType.onTick,
	[JsType.ON_SCENE_PAUSE]: EventHandlerType.instant,
	[JsType.ON_SCENE_PLAY]: EventHandlerType.instant,
	[JsType.ON_SCENE_RESET]: EventHandlerType.instant,
	[JsType.ON_TICK]: EventHandlerType.onTick,
	[JsType.ON_VIDEO_EVENT]: EventHandlerType.onTick,
	[JsType.ON_WEBXR_CONTROLLER_EVENT]: EventHandlerType.onTick, // TODO
};
const ON_TICK_METHOD_NAMES: Set<EvaluatorMethodName> = new Set(
	EVALUATOR_METHOD_NAMES.filter((methodName) => EVENT_MAP_LOGIC[methodName] == EventHandlerType.onTick)
);
const INSTANT_METHOD_NAMES: Set<EvaluatorMethodName> = new Set(
	EVALUATOR_METHOD_NAMES.filter((methodName) => EVENT_MAP_LOGIC[methodName] == EventHandlerType.instant)
);
if (0 + 0) {
	console.log({ON_TICK_METHOD_NAMES, INSTANT_METHOD_NAMES});
}

export abstract class ActorBuilderNode extends AssemblerControllerNode<JsAssemblerActor> {
	public abstract readonly compilationController: ActorCompilationController;
}

export class ActorsManager {
	private _actorNodes: Set<ActorBuilderNode> = new Set();
	private _keyboardEventsController: ActorKeyboardEventsController | undefined;
	private _manualTriggerController: ActorManualTriggersController | undefined;
	private _pointerEventsController: ActorPointerEventsController | undefined;
	// private _hoveredEventsController: ActorHoveredEventsController | undefined;
	// private _contextByObject: WeakMap<Object3D, ActorNodeTriggerContext> = new WeakMap();
	// private _context: EvaluationContext;
	// private _evaluatorByObjectByActorNode:WeakMap<Object3D,WeakMap<ActorJsSopNode,ActorEvaluator>>= new WeakMap()
	constructor(public readonly scene: PolyScene) {
		// this._context = {Object3D: scene.threejsScene()};
	}

	registerEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.scene.eventsDispatcher.registerEvaluatorGenerator(evaluatorGenerator);
	}
	unregisterEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.scene.eventsDispatcher.unregisterEvaluatorGenerator(evaluatorGenerator);
	}

	// private _eventDatas: Set<EventData> = new Set();
	// eventDatas() {
	// 	return this._eventDatas;
	// }
	// updateEvaluatorInputEvents() {
	// 	const functionNodes = this.scene.nodesController.nodesByContextAndType(NodeContext.SOP, SopType.ACTOR_JS);
	// 	this._eventDatas.clear();
	// 	for (let functionNode of functionNodes) {
	// 		const evaluator = functionNode.evaluator();
	// 		const eventDatas = evaluator.eventDatas;
	// 		if (eventDatas) {
	// 			for (let eventData of eventDatas) {
	// 				this._eventDatas.add(eventData);
	// 			}
	// 		}
	// 	}
	// 	this.scene.eventsDispatcher.updateControllersFromJsNodes();
	// }

	assignActorBuilder(object: Object3D, node: ActorBuilderNode) {
		let ids = this.objectActorNodeIds(object);
		if (!ids) {
			ids = [];
			object.userData[ACTOR_BUILDER_NODE_IDS_KEY] = ids;
		}
		const id = node.graphNodeId();
		if (!ids.includes(id)) {
			ids.push(id);
		}

		this._actorNodes.add(node);
		// this._findSceneEvents(node);
	}
	objectActorNodeIds(object: Object3D) {
		return object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
	}
	/*
	 *
	 * EVENTS
	 *
	 */
	get keyboardEventsController() {
		return (this._keyboardEventsController =
			this._keyboardEventsController || new ActorKeyboardEventsController(this));
	}
	get manualTriggerController() {
		return (this._manualTriggerController =
			this._manualTriggerController || new ActorManualTriggersController(this));
	}
	get pointerEventsController() {
		return (this._pointerEventsController =
			this._pointerEventsController || new ActorPointerEventsController(this));
	}
	// get hoveredEventsController() {
	// 	return (this._hoveredEventsController =
	// 		this._hoveredEventsController || new ActorHoveredEventsController(this));
	// }

	/*
	 *
	 * PUBLIC METHODS
	 *
	 */
	tick() {
		// this._manualTriggerController?.runTriggers();
		this._pointerEventsController?.runTriggers();
		this._keyboardEventsController?.runTriggers();
		// this.hoveredEventsController.runTriggers();
		this.scene.threejsScene().traverse((object) => {
			this.triggerEventNodes(object, 'onPointermove');
			// this.triggerEventNodes(object, JsType.ON_OBJECT_CLICK);
		});
		this._runOnEventTick();
	}
	runOnEventSceneReset() {
		this._onEventSceneResetTraverse();
	}
	runOnEventScenePlay() {
		this._onEventScenePlayTraverse();

		// any caching goes here
		// for (let type of ACTOR_TYPES_TO_INIT_ON_PLAY) {
		// 	const nodes = this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, type);
		// 	for (let node of nodes) {
		// 		node.initOnPlay();
		// 	}
		// }

		// this._makeRequiredObjectAttributesReactive();
	}
	runOnEventScenePause() {
		// for (let type of ACTOR_TYPES_TO_INIT_ON_PLAY) {
		// 	const nodes = this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, type);
		// 	for (let node of nodes) {
		// 		node.disposeOnPause();
		// 	}
		// }
		this._onEventScenePauseTraverse();
	}
	runOnEventPerformanceChange() {
		this._onEventPerformanceChangeTraverse();
	}

	/*
	 *
	 * PRIVATE METHODS
	 *
	 */
	private _runOnEventTick() {
		this._onEventTickTraverse();
	}

	// tick
	private _onEventTickBound = this._onEventTick.bind(this);
	private _onEventTick(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_TICK);
	}
	private _onEventTickTraverse() {
		// if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_TICK)) {
		// 	return;
		// }
		this.scene.threejsScene().traverse(this._onEventTickBound);
	}
	// reset
	private _onEventSceneResetBound = this._onEventSceneReset.bind(this);
	private _onEventSceneReset(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_RESET);
	}
	private _onEventSceneResetTraverse() {
		// if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_SCENE_RESET)) {
		// 	return;
		// }
		this.scene.threejsScene().traverse(this._onEventSceneResetBound);
	}
	// play
	private _onEventScenePlayBound = this._onEventScenePlay.bind(this);
	private _onEventScenePlay(object: Object3D) {
		this.triggerEventNodes(
			object,
			JsType.ON_SCENE_PLAY
			// OnScenePlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnScenePlayStateActorNode.OUTPUT_NAME_PLAY)
		);
	}
	private _onEventScenePlayTraverse() {
		// if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_SCENE_PLAY_STATE)) {
		// 	return;
		// }
		this.scene.threejsScene().traverse(this._onEventScenePlayBound);
	}
	// pause
	private _onEventScenePauseBound = this._onEventScenePause.bind(this);
	private _onEventScenePause(object: Object3D) {
		this.triggerEventNodes(
			object,
			JsType.ON_SCENE_PAUSE
			// OnScenePlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnScenePlayStateActorNode.OUTPUT_NAME_PAUSE)
		);
	}
	private _onEventScenePauseTraverse() {
		// if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_SCENE_PLAY_STATE)) {
		// 	return;
		// }
		this.scene.threejsScene().traverse(this._onEventScenePauseBound);
	}
	// performanceChange
	private _onEventPerformanceChangeBound = this._onEventPerformanceChange.bind(this);
	private _onEventPerformanceChange(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_PERFORMANCE_CHANGE);
		// // const actorType = ActorType.ON_PERFORMANCE_CHANGE;
		// const nodeIds = this.objectActorNodeIds(object);
		// if (!nodeIds) {
		// 	return;
		// }

		// this._context.Object3D = object
		// for (let nodeId of nodeIds) {
		// 	const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
		// 	if (node) {
		// 		const callback = node.evaluator().onPerformanceChange
		// 		if(callback){
		// 			callback(this._context)
		// 		}
		// 		// const onEventNodes = node.nodesByType(actorType);
		// 		// for (let onEventNode of onEventNodes) {
		// 		// 	let context = this._contextByObject.get(object);
		// 		// 	if (!context) {
		// 		// 		context = {Object3D: object};
		// 		// 		this._contextByObject.set(object, context);
		// 		// 	}
		// 		// 	onEventNode.runTriggerIfRequired(context);
		// 		// }
		// 	}
		// }
	}
	private _onEventPerformanceChangeTraverse() {
		// if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_PERFORMANCE_CHANGE)) {
		// 	return;
		// }
		this.scene.threejsScene().traverse(this._onEventPerformanceChangeBound);
	}
	//
	triggerEventNodes(object: Object3D, methodName: EvaluatorMethodName /*, __outputIndex__: number = 0*/) {
		const nodeIds = this.objectActorNodeIds(object);
		if (!nodeIds) {
			return;
		}

		for (let nodeId of nodeIds) {
			const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
			if (node) {
				this.triggerEventNode(node, object, methodName);
			}
		}
	}
	triggerEventNode(node: ActorBuilderNode, object: Object3D, methodName: EvaluatorMethodName) {
		const evaluatorGenerator = node.compilationController.evaluatorGenerator();
		this.triggerEvaluatorGenerator(evaluatorGenerator, object, methodName);
	}
	triggerEvaluatorGenerator(
		evaluatorGenerator: ActorEvaluatorGenerator,
		object: Object3D,
		methodName: EvaluatorMethodName
	) {
		const evaluator = evaluatorGenerator.findOrCreateEvaluator(object);
		if ((evaluator as any)[methodName]) {
			(evaluator as any)[methodName]!();
		}
	}

	// param

	// video
	// onEventVideoPlayTraverse(videoNode: VideoCopNode) {
	// 	if (
	// 		this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, ActorType.ON_VIDEO_PLAY_STATE).length ==
	// 		0
	// 	) {
	// 		return;
	// 	}
	// 	this.scene.threejsScene().traverse((object) => {
	// 		this._triggerVideoEventNodes(
	// 			object,
	// 			videoNode,
	// 			OnVideoPlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnVideoPlayStateActorNode.OUTPUT_NAME_PLAY)
	// 		);
	// 	});
	// }
	// onEventVideoPauseTraverse(videoNode: VideoCopNode) {
	// 	if (
	// 		this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, ActorType.ON_VIDEO_PLAY_STATE).length ==
	// 		0
	// 	) {
	// 		return;
	// 	}
	// 	this.scene.threejsScene().traverse((object) => {
	// 		this._triggerVideoEventNodes(
	// 			object,
	// 			videoNode,
	// 			OnVideoPlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnVideoPlayStateActorNode.OUTPUT_NAME_PAUSE)
	// 		);
	// 	});
	// }
	// private _triggerVideoEventNodes(object: Object3D, videoNode: VideoCopNode, outputIndex: number = 0) {
	// 	const nodeIds = this.objectActorNodeIds(object);
	// 	if (!nodeIds) {
	// 		return;
	// 	}

	// 	for (let nodeId of nodeIds) {
	// 		const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
	// 		if (node) {
	// 			const onEventNodes = node.nodesByType(ActorType.ON_VIDEO_PLAY_STATE);
	// 			for (let onEventNode of onEventNodes) {
	// 				if (onEventNode.listensToVideoNode(videoNode)) {
	// 					onEventNode.runTrigger({Object3D: object}, outputIndex);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// private _makeRequiredObjectAttributesReactive() {
	// 	// this.scene.threejsScene().traverse((object) => {
	// 	// 	const getNodesByAttribName = () => {
	// 	// 		const nodeIds = this.objectActorNodeIds(object);
	// 	// 		if (!nodeIds) {
	// 	// 			return;
	// 	// 		}
	// 	// 		// check nodes listening to this object
	// 	// 		const actorBuilderNodes = nodeIds
	// 	// 			.map((nodeId) => this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
	// 	// 			.filter((node) => node);
	// 	// 		const onEventObjectAttributeUpdatedNodes = actorBuilderNodes
	// 	// 			.map((node) => node.nodesByType(ActorType.ON_OBJECT_ATTRIBUTE_UPDATE))
	// 	// 			.flat();
	// 	// 		const nodesByAttribName = MapUtils.groupBy(onEventObjectAttributeUpdatedNodes, (node) =>
	// 	// 			node.attributeName()
	// 	// 		);
	// 	// 		return nodesByAttribName;
	// 	// 	};
	// 	// 	// check nodes listening to this parent
	// 	// 	const getParentNodesByAttribName = () => {
	// 	// 		const parent = object.parent;
	// 	// 		if (!parent) {
	// 	// 			return;
	// 	// 		}
	// 	// 		const nodeIds = parent.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
	// 	// 		if (!nodeIds) {
	// 	// 			return;
	// 	// 		}
	// 	// 		// check nodes listening to this object
	// 	// 		const actorBuilderNodes = nodeIds
	// 	// 			.map((nodeId) => this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
	// 	// 			.filter((node) => node);
	// 	// 		const onEventChildAttributeUpdatedNodes = actorBuilderNodes
	// 	// 			.map((node) => node.nodesByType(ActorType.ON_CHILD_ATTRIBUTE_UPDATE))
	// 	// 			.flat();
	// 	// 		const nodesByAttribName = MapUtils.groupBy(onEventChildAttributeUpdatedNodes, (node) =>
	// 	// 			node.attributeName()
	// 	// 		);
	// 	// 		return nodesByAttribName;
	// 	// 	};
	// 	// 	const nodesByAttribName = getNodesByAttribName();
	// 	// 	const parentNodesByAttribName = getParentNodesByAttribName();
	// 	// 	if (!(nodesByAttribName || parentNodesByAttribName)) {
	// 	// 		return;
	// 	// 	}
	// 	// 	const reactiveAttributeNames: Set<string> = new Set();
	// 	// 	nodesByAttribName?.forEach((nodes, attributeName) => {
	// 	// 		reactiveAttributeNames.add(attributeName);
	// 	// 	});
	// 	// 	parentNodesByAttribName?.forEach((nodes, attributeName) => {
	// 	// 		reactiveAttributeNames.add(attributeName);
	// 	// 	});
	// 	// 	reactiveAttributeNames.forEach((attributeName) => {
	// 	// 		const directActorNodes = nodesByAttribName?.get(attributeName);
	// 	// 		const parentNodes = parentNodesByAttribName?.get(attributeName);
	// 	// 		// apply callback
	// 	// 		CoreObject.makeAttribReactive<AttribValue, CoreObjectType>(
	// 	// 			object,
	// 	// 			attributeName,
	// 	// 			(proxy: AttributeProxy<AttribValue>) => {
	// 	// 				// console.log('callback', object);
	// 	// 				// if (proxy.callbackRanAtFrame >= this.scene.frame()) {
	// 	// 				// 	console.log('already reacted at frame', this.scene.frame());
	// 	// 				// 	return;
	// 	// 				// }
	// 	// 				// proxy.callbackRanAtFrame = this.scene.frame();
	// 	// 				let context = this._contextByObject.get(object);
	// 	// 				if (!context) {
	// 	// 					context = {Object3D: object};
	// 	// 					this._contextByObject.set(object, context);
	// 	// 				}
	// 	// 				if (directActorNodes) {
	// 	// 					for (let node of directActorNodes) {
	// 	// 						node.runTrigger(context);
	// 	// 					}
	// 	// 				}
	// 	// 				if (parentNodes) {
	// 	// 					const parent = object.parent;
	// 	// 					if (parent) {
	// 	// 						const parentContext = {Object3D: parent};
	// 	// 						for (let parentNode of parentNodes) {
	// 	// 							parentNode.runTrigger(parentContext);
	// 	// 						}
	// 	// 					}
	// 	// 				}
	// 	// 			}
	// 	// 		);
	// 	// 	});
	// 	// });
	// }

	// parentActorBuilderNode(node: BaseActorNodeType) {
	// 	return node.parentController.findParent((parent) => parent.childrenControllerContext() == NodeContext.ACTOR);
	// }
}
