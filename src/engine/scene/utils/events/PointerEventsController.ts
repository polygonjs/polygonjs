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
	protected override _requireCanvasEventListeners: boolean = true;
	type() {
		return 'pointer';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_POINTER_EVENT_TYPES.map((n) => `${n}`));
	}
}
