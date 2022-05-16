// https://developer.mozilla.org/en-US/docs/Web/Events
export enum KeyboardEventType {
	keydown = 'keydown',
	keypress = 'keypress',
	keyup = 'keyup',
}
export const ACCEPTED_KEYBOARD_EVENT_TYPES: KeyboardEventType[] = [
	KeyboardEventType.keydown,
	KeyboardEventType.keypress,
	KeyboardEventType.keyup,
];
