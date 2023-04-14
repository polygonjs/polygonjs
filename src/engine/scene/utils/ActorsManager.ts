import {Object3D} from 'three';
import {PolyScene} from '../PolyScene';
import {ActorManualTriggersController} from './actors/ManualTriggersController';
import {ActorKeyboardEventsController} from './actors/ActorsKeyboardEventsController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorMethodName, EVALUATOR_METHOD_NAMES} from '../../nodes/js/code/assemblers/actor/Evaluator';
import {ActorEvaluatorGenerator} from '../../nodes/js/code/assemblers/actor/EvaluatorGenerator';
import {ActorPointerEventsController} from './actors/ActorsPointerEventsController';
import {AssemblerControllerNode} from '../../nodes/js/code/Controller';
import {JsAssemblerActor} from '../../nodes/js/code/assemblers/actor/ActorAssembler';
import {ActorCompilationController} from '../../../core/actor/ActorCompilationController';

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
	}
	runOnEventScenePause() {
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
		this.scene.threejsScene().traverse(this._onEventTickBound);
	}
	// reset
	private _onEventSceneResetBound = this._onEventSceneReset.bind(this);
	private _onEventSceneReset(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_RESET);
	}
	private _onEventSceneResetTraverse() {
		this.scene.threejsScene().traverse(this._onEventSceneResetBound);
	}
	// play
	private _onEventScenePlayBound = this._onEventScenePlay.bind(this);
	private _onEventScenePlay(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_PLAY);
	}
	private _onEventScenePlayTraverse() {
		this.scene.threejsScene().traverse(this._onEventScenePlayBound);
	}
	// pause
	private _onEventScenePauseBound = this._onEventScenePause.bind(this);
	private _onEventScenePause(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_PAUSE);
	}
	private _onEventScenePauseTraverse() {
		this.scene.threejsScene().traverse(this._onEventScenePauseBound);
	}
	// performanceChange
	private _onEventPerformanceChangeBound = this._onEventPerformanceChange.bind(this);
	private _onEventPerformanceChange(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_PERFORMANCE_CHANGE);
	}
	private _onEventPerformanceChangeTraverse() {
		this.scene.threejsScene().traverse(this._onEventPerformanceChangeBound);
	}
	//
	triggerEventNodes(object: Object3D, methodName: EvaluatorMethodName) {
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
}
