import {BaseSceneEventsController} from './_BaseEventsController';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {ACCEPTED_TOUCH_EVENT_TYPES} from '../../../../core/event/TouchEventType';
// import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';

export class TouchEventsController extends BaseSceneEventsController<
	MouseEvent,
	PointerEventNode
	// BaseUserInputActorNodeType
> {
	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'touch';
	}
	acceptedEventTypes() {
		return new Set([...ACCEPTED_TOUCH_EVENT_TYPES]);
	}
}
