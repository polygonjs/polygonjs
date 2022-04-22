import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {CoreEventEmitter} from '../../../viewers/utils/EventsController';
import {EventData} from '../../../nodes/event/_BaseInput';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Vector2} from 'three';
import {Camera} from 'three';

import {Raycaster} from 'three';
import {RaycasterForBVH} from '../../../operations/sop/utils/Bvh/three-mesh-bvh';
function createRaycaster() {
	const raycaster = new Raycaster() as RaycasterForBVH;
	raycaster.firstHitOnly = true;
	return raycaster;
}
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
	private _raycaster = createRaycaster();
	type() {
		return 'pointer';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`));
	}

	override processEvent(eventContext: EventContext<MouseEvent>) {
		super.processEvent(eventContext);

		if (this._actorEventNames.size == 0) {
			return;
		}
		if (!eventContext.event) {
			return;
		}
		const eventType = eventContext.event.type;
		if (!this._actorEventNames.has(eventType)) {
			return;
		}
		this._camera = eventContext.viewer?.cameraNode().object;
		this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
		if (this._camera) {
			this._raycaster.setFromCamera(this._cursor, this._camera);
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
