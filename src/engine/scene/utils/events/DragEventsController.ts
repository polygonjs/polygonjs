import {BaseSceneEventsController} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
enum DragEventType {
	dragover = 'dragover',
}
export const ACCEPTED_DRAG_EVENT_TYPES: DragEventType[] = [DragEventType.dragover];

export class DragEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
	protected _require_canvas_event_listeners: boolean = true;
	type() {
		return 'drag';
	}
	acceptedEventTypes() {
		return ACCEPTED_DRAG_EVENT_TYPES.map((n) => `${n}`);
	}
}
