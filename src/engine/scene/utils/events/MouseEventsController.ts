import {BaseSceneEventsController} from './_BaseEventsController';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {ACCEPTED_MOUSE_EVENT_TYPES} from '../../../../core/event/MouseEventType';
// import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';

export class MouseEventsController extends BaseSceneEventsController<
	MouseEvent,
	MouseEventNode
	// BaseUserInputActorNodeType
> {
	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'mouse';
	}
	acceptedEventTypes() {
		return new Set([...ACCEPTED_MOUSE_EVENT_TYPES]);
	}
	// accepts_event(event: MouseEvent) {
	// 	return ACCEPTED_MOUSE_EVENT_TYPES.includes(event.type as MouseEventType);
	// }
}
