import {BaseSceneEventsController} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
// import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
enum DragEventType {
	dragover = 'dragover',
}
export const ACCEPTED_DRAG_EVENT_TYPES: DragEventType[] = [DragEventType.dragover];

export class DragEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'drag';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_DRAG_EVENT_TYPES.map((n) => `${n}`));
	}
}
