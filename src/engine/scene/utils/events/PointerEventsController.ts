import {BaseSceneEventsController} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';

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

export class PointerEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
	protected _require_canvas_event_listeners: boolean = true;
	type() {
		return 'pointer';
	}
	accepted_event_types() {
		return ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`);
	}
}
