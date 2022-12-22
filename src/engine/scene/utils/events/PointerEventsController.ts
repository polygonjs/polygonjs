import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Raycaster, Vector2} from 'three';
import {Camera} from 'three';
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
	protected _cursor: Vector2 = new Vector2();
	protected _camera: Camera | undefined;
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

		// if (this._actorEventNames.size == 0) {
		// 	return;
		// }
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
		// if (!this._actorEventNames.has(eventType)) {
		// 	return;
		// }
		this._camera = viewer.camera();
		this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
		if (this._camera) {
			viewer.raycastersController.setCursor0(this._cursor);
			this._raycaster = viewer.raycastersController.raycaster0();
		}

		// if (nodesToTrigger) {
		this.dispatcher.scene.actorsManager.pointerEventsController.setTriggeredNodes(nodesToTrigger);
		// }
		// switch (eventType) {
		// 	case PointerEventType.pointerdown: {
		// 		this._pointerdownRegistered = true;
		// 		break;
		// 	}
		// 	case PointerEventType.pointerup: {
		// 		this._pointerupRegistered = true;
		// 		break;
		// 	}
		// }
	}

	// protected override _actorEventDatas(): EventData[] | undefined {
	// 	const eventDatas: EventData[] = [];
	// 	this._actorEventNames.forEach((eventName) => {
	// 		const eventData = ACTOR_EVENT_DATA[eventName as PointerEventsControllerAvailableEventNames];
	// 		if (eventData) {
	// 			eventDatas.push(eventData);
	// 		}
	// 	});
	// 	console.log(eventDatas);
	// 	return eventDatas;
	// }

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
