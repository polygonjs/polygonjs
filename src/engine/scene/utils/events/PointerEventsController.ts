import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Raycaster, Vector2} from 'three';
import type {PointerEventActorNode} from '../actors/ActorsPointerEventsController';
import {ACCEPTED_POINTER_EVENT_TYPES} from '../../../../core/event/PointerEventType';

interface RaycasterUpdateOptions {
	pointsThreshold: number;
	lineThreshold: number;
}

// type PointerEventsControllerAvailableEventNames = 'pointermove' | 'pointerdown' | 'pointerup';

export class PointerEventsController extends BaseSceneEventsController<
	MouseEvent,
	PointerEventNode,
	PointerEventActorNode
> {
	protected override _requireCanvasEventListeners: boolean = true;
	private _cursorHelper: CursorHelper = new CursorHelper();
	// init to a large value so we don't get a fake intersect
	// if there was no interaction
	protected _cursor: Vector2 = new Vector2(-1000, -1000);
	// protected _camera: Camera | undefined;
	private _raycaster: Raycaster = new Raycaster();
	type() {
		return 'pointer';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`));
	}

	setRaycaster(raycaster: Raycaster) {
		// giving a raycaster here is useful to still benefit from mouse events, even if not viewer has been created
		this._raycaster = raycaster;
	}

	override processEvent(eventContext: EventContext<MouseEvent>) {
		super.processEvent(eventContext);

		const eventEmitter = eventContext.emitter;
		if (!eventEmitter) {
			return;
		}
		const {viewer, event} = eventContext;
		if (!(event && viewer)) {
			return;
		}
		const eventType = event.type;
		const mapForEvent = this._actorNodesByEventNames.get(eventType);
		if (!mapForEvent) {
			return;
		}
		const nodesToTrigger = mapForEvent.get(eventEmitter);
		if (!nodesToTrigger) {
			return;
		}

		// const camera = viewer.camera();
		this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
		// if (camera) {
		viewer.raycastersController.setCursor0(this._cursor);
		// even though the update is in the render loop
		// it may be more up to date to do it here as well
		viewer.raycastersController.update();
		this._raycaster = viewer.raycastersController.raycaster0();
		// }

		this.dispatcher.scene.actorsManager.pointerEventsController.setTriggeredNodes(nodesToTrigger);
	}

	raycaster() {
		return this._raycaster;
	}
	cursor() {
		return this._cursor;
	}
	// camera() {
	// 	return this._camera;
	// }

	updateRaycast(options: RaycasterUpdateOptions) {
		if (!this._raycaster) {
			return;
		}
		const pointsParam = this._raycaster.params.Points;
		if (pointsParam) {
			pointsParam.threshold = options.pointsThreshold;
		}
		const lineParam = this._raycaster.params.Line;
		if (lineParam) {
			lineParam.threshold = options.lineThreshold;
		}
	}
}
