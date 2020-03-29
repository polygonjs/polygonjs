import {BaseEventsController} from './_BaseEventsController';
import {MouseEventNode} from '../../../nodes/event/MouseEvent';

enum MouseEventType {
	DOWN = 'mousedown',
	MOVE = 'mousemove',
	UP = 'mouseup',
	ENTER = 'mouseenter',
	LEAVE = 'mouseleave',
}
export const ACCEPTED_MOUSE_EVENT_TYPES: MouseEventType[] = [
	MouseEventType.DOWN,
	MouseEventType.MOVE,
	MouseEventType.UP,
	MouseEventType.ENTER,
	MouseEventType.LEAVE,
];

export class MouseEventsController extends BaseEventsController<MouseEvent, MouseEventNode> {
	accepts_event(event: MouseEvent) {
		return ACCEPTED_MOUSE_EVENT_TYPES.includes(event.type as MouseEventType);
	}
}
