import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
// import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Raycaster, Vector2} from 'three';
// import type {PointerEventActorNode} from '../actors/ActorsPointerEventsController';
import {ACCEPTED_POINTER_EVENT_TYPES} from '../../../../core/event/PointerEventType';
import {ref} from '../../../../core/reactivity';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {createRaycaster} from '../../../../core/RaycastHelper';

export interface RaycasterUpdateOptions {
	pointsThreshold: number;
	lineThreshold: number;
}

// type PointerEventsControllerAvailableEventNames = 'pointermove' | 'pointerdown' | 'pointerup';

export class PointerEventsController extends BaseSceneEventsController<
	MouseEvent,
	PointerEventNode
	// PointerEventActorNode
> {
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
		return new Set(ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`));
	}

	setRaycaster(raycaster: Raycaster) {
		// giving a raycaster here is useful to still benefit from mouse events, even if no viewer has been created
		this._raycaster0.value = raycaster;
	}

	override processEvent(eventContext: EventContext<MouseEvent>) {
		this._cursorHelper.setCursorForCPU(eventContext, this._cursor0.value);
		// super.processEvent(eventContext);

		const {viewer, event} = eventContext;
		if (!(event && viewer)) {
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

		const eventType = event.type;
		if (eventType == 'pointermove') {
			// pointermove is not processed here,
			// since callbacks such as onObjectHover
			// should be triggered even if the pointer is not moving
			// (for instance if instead  the object is moving).
			// It is therefore triggered via the ActorsManager
			return;
		}

		const mapForEvent = this._actorEvaluatorsByEventNames.get(eventType);
		if (!mapForEvent) {
			return;
		}
		const eventEmitter = eventContext.emitter;
		if (!eventEmitter) {
			return;
		}
		const evaluatorGenerators = mapForEvent.get(eventEmitter);
		if (!evaluatorGenerators) {
			return;
		}
		evaluatorGenerators.forEach((evaluatorGenerator) => {
			evaluatorGenerator.traverseEvaluator((evaluator) => {
				if (evaluator.onObjectClick) {
					evaluator.onObjectClick();
				}
			});
		});
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
