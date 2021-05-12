import {BaseSceneEventsController} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';

// https://developer.mozilla.org/en-US/docs/Web/Events
enum WindowEventType {
	resize = 'resize',
}
export const ACCEPTED_WINDOW_EVENT_TYPES: WindowEventType[] = [WindowEventType.resize];

export class WindowEventsController extends BaseSceneEventsController<Event, PointerEventNode> {
	protected _require_canvas_event_listeners: boolean = true;
	type() {
		return 'window';
	}
	acceptedEventTypes() {
		return ACCEPTED_WINDOW_EVENT_TYPES.map((n) => `${n}`);
	}
}
