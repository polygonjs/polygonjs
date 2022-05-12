import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {CoreEventEmitter} from '../../../viewers/utils/ViewerEventsController';
import {EventData} from '../../../nodes/event/_BaseInput';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Raycaster, Vector2} from 'three';
import {Camera} from 'three';

interface RaycasterUpdateOptions {
	pointsThreshold: number;
	lineThreshold: number;
}

// https://developer.mozilla.org/en-US/docs/Web/Events
enum PointerEventType {
	pointerdown = 'pointerdown',
	pointermove = 'pointermove',
	pointerup = 'pointerup',
}
export const ACCEPTED_POINTER_EVENT_TYPES: PointerEventType[] = [
	PointerEventType.pointerdown,
	PointerEventType.pointermove,
	PointerEventType.pointerup,
];

const ACTOR_EVENT_DATA_POINTERMOVE: EventData = {
	type: PointerEventType.pointermove,
	emitter: CoreEventEmitter.CANVAS,
};
const ACTOR_EVENT_DATA_POINTERDOWN: EventData = {
	type: PointerEventType.pointerdown,
	emitter: CoreEventEmitter.CANVAS,
};
const ACTOR_EVENT_DATA_POINTERUP: EventData = {
	type: PointerEventType.pointerup,
	emitter: CoreEventEmitter.CANVAS,
};
type PointerEventsControllerAvailableEventNames = 'pointermove' | 'pointerdown' | 'pointerup';
const ACTOR_EVENT_DATA = {
	[PointerEventType.pointermove]: ACTOR_EVENT_DATA_POINTERMOVE,
	[PointerEventType.pointerdown]: ACTOR_EVENT_DATA_POINTERDOWN,
	[PointerEventType.pointerup]: ACTOR_EVENT_DATA_POINTERUP,
};

export class PointerEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
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
		const {viewer, event} = eventContext;

		if (this._actorEventNames.size == 0) {
			return;
		}
		if (!(event && viewer)) {
			return;
		}
		const eventType = event.type;
		if (!this._actorEventNames.has(eventType)) {
			return;
		}
		this._camera = viewer.camera();
		this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
		if (this._camera) {
			viewer.raycaster.setFromCamera(this._cursor, this._camera);
			this._raycaster = viewer.raycaster;
		}
		const nodesToTrigger = this._actorNodesByEventNames.get(eventType);
		if (nodesToTrigger) {
			this.dispatcher.scene.actorsManager.pointerEventsController.setTriggeredNodes(nodesToTrigger);
		}
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

	protected override _actorEventDatas(): EventData[] | undefined {
		const eventDatas: EventData[] = [];
		this._actorEventNames.forEach((eventName) => {
			const eventData = ACTOR_EVENT_DATA[eventName as PointerEventsControllerAvailableEventNames];
			if (eventData) {
				eventDatas.push(eventData);
			}
		});
		return eventDatas;
	}

	raycaster() {
		return this._raycaster;
	}
	// cursor() {
	// 	return this._cursor;
	// }
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
