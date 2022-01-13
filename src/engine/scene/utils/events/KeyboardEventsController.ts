import {BaseSceneEventsController} from './_BaseEventsController';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';

// https://developer.mozilla.org/en-US/docs/Web/Events
enum KeyboardEventType {
	keydown = 'keydown',
	keypress = 'keypress',
	keyup = 'keyup',
}
export const ACCEPTED_KEYBOARD_EVENT_TYPES: KeyboardEventType[] = [
	KeyboardEventType.keydown,
	KeyboardEventType.keypress,
	KeyboardEventType.keyup,
];

export class KeyboardEventsController extends BaseSceneEventsController<KeyboardEvent, KeyboardEventNode> {
	protected _requireCanvasEventListeners: boolean = true;
	type() {
		return 'keyboard';
	}
	acceptedEventTypes() {
		return new Set(ACCEPTED_KEYBOARD_EVENT_TYPES.map((n) => `${n}`));
	}
	// accepts_event(event: MouseEvent) {
	// 	return ACCEPTED_KEYBOARD_EVENT_TYPES.includes(event.type as KeyboardEventType);
	// }
}
