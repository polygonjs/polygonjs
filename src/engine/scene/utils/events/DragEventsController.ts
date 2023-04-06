import {BaseSceneEventsController} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {ACCEPTED_DRAG_EVENT_TYPES} from '../../../../core/event/DragEventType';
// import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';

export class DragEventsController extends BaseSceneEventsController<MouseEvent, PointerEventNode> {
	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'drag';
	}
	acceptedEventTypes() {
		return new Set([...ACCEPTED_DRAG_EVENT_TYPES]);
	}
}
