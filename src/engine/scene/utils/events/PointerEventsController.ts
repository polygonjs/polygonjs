import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
// import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Raycaster, Vector2} from 'three';
import {ActorPointerEventsController} from '../actors/ActorsPointerEventsController';
import {ACCEPTED_POINTER_EVENT_TYPES, PointerEventType} from '../../../../core/event/PointerEventType';
import {ref} from '../../../../core/reactivity/CoreReactivity';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {createRaycaster} from '../../../../core/RaycastHelper';
import {EvaluatorPointerMethod} from '../../../nodes/js/code/assemblers/actor/Evaluator';
import {JsType} from '../../../poly/registers/nodes/types/Js';
import {SceneEventsDispatcher} from './EventsDispatcher';
export interface RaycasterUpdateOptions {
	pointsThreshold: number;
	lineThreshold: number;
}

// type PointerEventsControllerAvailableEventNames = 'pointermove' | 'pointerdown' | 'pointerup';
const methodNameByEventType: Record<PointerEventType, EvaluatorPointerMethod> = {
	[PointerEventType.click]: 'onClick',
	[PointerEventType.pointerdown]: JsType.ON_POINTERDOWN,
	[PointerEventType.pointermove]: 'onPointermove',
	[PointerEventType.pointerup]: JsType.ON_POINTERUP,
	[PointerEventType.touchstart]: JsType.ON_POINTERDOWN,
	[PointerEventType.touchmove]: 'onPointermove',
	[PointerEventType.touchend]: JsType.ON_POINTERUP,
};

export class PointerEventsController extends BaseSceneEventsController<
	MouseEvent | TouchEvent,
	PointerEventNode
	// PointerEventActorNode
> {
	private pointerEventsController: ActorPointerEventsController;
	constructor(dispatcher: SceneEventsDispatcher) {
		super(dispatcher);
		this.pointerEventsController = this.dispatcher.scene.actorsManager.pointerEventsController;
	}
	protected override _requireCanvasEventListeners: boolean = true;
	private _cursorHelper: CursorHelper = new CursorHelper();
	// init to a large value so we don't get a fake intersect
	// if there was no interaction
	protected _cursor0 = ref<Vector2>(new Vector2(-1000, -1000));
	// protected _camera: Camera | undefined;
	private _raycaster0 = ref<Raycaster>(createRaycaster());
	type() {
		return 'pointer';
	}
	acceptedEventTypes() {
		return new Set([...ACCEPTED_POINTER_EVENT_TYPES]);
	}

	setRaycaster(raycaster: Raycaster) {
		// giving a raycaster here is useful to still benefit from mouse events, even if no viewer has been created
		this._raycaster0.value = raycaster;
	}

	override processEvent(eventContext: EventContext<MouseEvent | TouchEvent>) {
		this._cursorHelper.setCursorForCPU(eventContext, this._cursor0.value);
		super.processEvent(eventContext);

		const {viewer, event} = eventContext;
		if (!(event && viewer)) {
			console.log('either event or viewer missing');
			return;
		}

		// const camera = viewer.camera();
		// this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
		// if (camera) {
		viewer.raycastersController.setCursor0(this._cursor0.value);
		// even though the update is in the render loop
		// it may be more up to date to do it here as well
		viewer.raycastersController.updateRaycasters();
		// this._raycaster = viewer.raycastersController.raycaster0();
		// }

		const eventType = event.type as PointerEventType;
		if (eventType == PointerEventType.pointermove) {
			// pointermove is not processed here,
			// since callbacks such as onObjectHover
			// should be triggered even if the pointer is not moving
			// (for instance if instead  the object is moving).
			// It is therefore triggered via the ActorsManager
			return;
		}

		const mapForEvent = this._actorEvaluatorsByEventNames.get(eventType);
		if (!mapForEvent) {
			// console.log('no map for eventType', eventType);
			return;
		}
		const eventEmitter = eventContext.emitter;
		if (!eventEmitter) {
			// console.log('no emitter for context', eventContext);
			return;
		}
		const evaluatorGenerators = mapForEvent.get(eventEmitter);
		if (!evaluatorGenerators) {
			// console.log('no generators for emitter', eventEmitter);
			return;
		}
		const methodName = methodNameByEventType[eventType];
		// for (let methodName of methodNames) {
		this.pointerEventsController.addTriggeredEvaluators(evaluatorGenerators, methodName);
		// }
		// console.log('evaluatorGenerators', evaluatorGenerators);
		//
		// evaluatorGenerators.forEach((evaluatorGenerator) => {
		// 	evaluatorGenerator.traverseEvaluator((evaluator) => {
		// 		console.log({evaluator}, evaluator.onObjectClick);
		// 		if (evaluator[methodName]) {
		// 			evaluator[methodName]!();
		// 		} else {
		// 			console.log('method not found on object for event type', eventType);
		// 		}
		// 	});
		// });
		// this.dispatcher.scene.actorsManager.pointerEventsController.setTriggeredNodes(nodesToTrigger);
	}

	raycaster() {
		return this._raycaster0;
	}
	cursor() {
		return this._cursor0;
	}
	// camera() {
	// 	return this._camera;
	// }

	updateRaycast(options: RaycasterUpdateOptions) {
		// if (!this._raycaster0) {
		// 	return;
		// }
		const pointsParam = this._raycaster0.value.params.Points;
		if (pointsParam) {
			pointsParam.threshold = options.pointsThreshold;
		}
		const lineParam = this._raycaster0.value.params.Line;
		if (lineParam) {
			lineParam.threshold = options.lineThreshold;
		}
	}
}
