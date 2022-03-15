import {BaseSceneEventsController, EventContext} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {CoreEventEmitter} from '../../../viewers/utils/EventsController';
import {EventData} from '../../../nodes/event/_BaseInput';
import {CursorHelper} from '../../../nodes/event/utils/CursorHelper';
import {Vector2} from 'three/src/math/Vector2';
import {Camera} from 'three/src/cameras/Camera';

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

const PERSISTENT_EVENT_DATA: EventData = {type: PointerEventType.pointermove, emitter: CoreEventEmitter.CANVAS};

export class PointerEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
	protected override _requireCanvasEventListeners: boolean = true;
	private _cursorHelper: CursorHelper = new CursorHelper();
	protected _cursor: Vector2 = new Vector2();
	protected _camera: Camera | undefined;

	type() {
		return 'pointer';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`));
	}

	override processEvent(eventContext: EventContext<MouseEvent>) {
		super.processEvent(eventContext);
		if (eventContext.event && eventContext.event.type == PERSISTENT_EVENT_DATA.type) {
			this._cursorHelper.setCursorForCPU(eventContext, this._cursor);
			this._camera = eventContext.viewer?.cameraNode().object;
		}
	}

	protected override _persistentEventData(): EventData | undefined {
		return PERSISTENT_EVENT_DATA;
	}

	cursor() {
		return this._cursor;
	}
	camera() {
		return this._camera;
	}
}
