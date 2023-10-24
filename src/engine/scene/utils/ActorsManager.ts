import {Object3D} from 'three';
import {PolyScene} from '../PolyScene';
import {ActorManualTriggersController} from './actors/ManualTriggersController';
import {ActorKeyboardEventsController} from './actors/ActorsKeyboardEventsController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {EvaluatorMethodName, EVALUATOR_METHOD_NAMES} from '../../nodes/js/code/assemblers/actor/ActorEvaluator';
import {ActorEvaluatorGenerator} from '../../nodes/js/code/assemblers/actor/ActorEvaluatorGenerator';
import {ActorPointerEventsController} from './actors/ActorsPointerEventsController';
import {AssemblerControllerNode} from '../../nodes/js/code/Controller';
import {JsAssemblerActor} from '../../nodes/js/code/assemblers/actor/ActorAssembler';
import {ActorCompilationController} from '../../../core/actor/ActorCompilationController';
import {ObjectContent, CoreObjectType} from '../../../core/geometry/ObjectContent';
import {hierarchyTraverse} from '../../../core/geometry/util/HierarchyTraverse';
import {Poly} from '../../Poly';

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
	// ['onClick']: EventHandlerType.onTick,
	['onContextMenu']: EventHandlerType.onTick,
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
	private _keyboardEventsController: ActorKeyboardEventsController | undefined;
	private _manualTriggerController: ActorManualTriggersController | undefined;
	private _pointerEventsController: ActorPointerEventsController | undefined;
	constructor(public readonly scene: PolyScene) {}

	registerEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.scene.eventsDispatcher.registerEvaluatorGenerator(evaluatorGenerator);
	}
	unregisterEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.scene.eventsDispatcher.unregisterEvaluatorGenerator(evaluatorGenerator);
	}

	assignActorBuilder(object: ObjectContent<CoreObjectType>, node: ActorBuilderNode) {
		let ids = this.objectActorNodeIds(object);
		if (!ids) {
			ids = [];
			object.userData[ACTOR_BUILDER_NODE_IDS_KEY] = ids;
		}
		const id = node.graphNodeId();
		if (!ids.includes(id)) {
			ids.push(id);
		}
		Poly.onObjectsAddRemoveHooks.assignOnRemoveHookHandler(object, node);
	}
	objectActorNodeIds(object: ObjectContent<CoreObjectType>) {
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
		this._pointerEventsController?.runTriggers();
		this._keyboardEventsController?.runTriggers();
		hierarchyTraverse(this.scene.threejsScene(), (object) => {
			this.triggerEventNodes(object, 'onPointermove');
			this._onEventTickBound(object);
		});
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

	// tick
	private _onEventTickBound = this._onEventTick.bind(this);
	private _onEventTick(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_TICK);
	}

	// reset
	private _onEventSceneResetBound = this._onEventSceneReset.bind(this);
	private _onEventSceneReset(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_RESET);
	}
	private _onEventSceneResetTraverse() {
		hierarchyTraverse(this.scene.threejsScene(), this._onEventSceneResetBound);
	}
	// play
	private _onEventScenePlayBound = this._onEventScenePlay.bind(this);
	private _onEventScenePlay(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_PLAY);
	}
	private _onEventScenePlayTraverse() {
		hierarchyTraverse(this.scene.threejsScene(), this._onEventScenePlayBound);
	}
	// pause
	private _onEventScenePauseBound = this._onEventScenePause.bind(this);
	private _onEventScenePause(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_SCENE_PAUSE);
	}
	private _onEventScenePauseTraverse() {
		hierarchyTraverse(this.scene.threejsScene(), this._onEventScenePauseBound);
	}
	// performanceChange
	private _onEventPerformanceChangeBound = this._onEventPerformanceChange.bind(this);
	private _onEventPerformanceChange(object: Object3D) {
		this.triggerEventNodes(object, JsType.ON_PERFORMANCE_CHANGE);
	}
	private _onEventPerformanceChangeTraverse() {
		hierarchyTraverse(this.scene.threejsScene(), this._onEventPerformanceChangeBound);
	}
	//
	triggerEventNodes(object: Object3D, methodName: EvaluatorMethodName) {
		const nodeIds = this.objectActorNodeIds(object);
		if (!nodeIds) {
			return;
		}

		for (const nodeId of nodeIds) {
			// we need to test that the object has a parent,
			// as it could have multiple actor attached,
			// and if the first one from nodeIds triggers the object removal
			// from the hierarchy, going through the following actor nodes
			// will regenerate an evaluator for an object that is not in the hierarchy anymore
			if (object.parent == null) {
				return;
			}
			const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;

			if (node) {
				this.triggerEventNode(node, object, methodName);
			}
		}
	}
	triggerEventNode(node: ActorBuilderNode, object: Object3D, methodName: EvaluatorMethodName) {
		const evaluatorGenerator = node.compilationController.evaluatorGenerator();
		this._triggerEvaluatorGenerator(evaluatorGenerator, object, methodName);
	}
	private _triggerEvaluatorGenerator(
		evaluatorGenerator: ActorEvaluatorGenerator,
		object: Object3D,
		methodName: EvaluatorMethodName
	) {
		// we can't yet create evaluators only when the method requested here exists,
		// as this fails for onObjectClick methods, which are called from the relevant event controller
		// if (onlyIfMethodExists == true && !evaluatorGenerator.hasExpectedEvaluatorMethodName(methodName)) {
		// 	return;
		// }
		const evaluator = evaluatorGenerator.findOrCreateEvaluator(object);

		if ((evaluator as any)[methodName]) {
			(evaluator as any)[methodName]!();
		}
	}
}
