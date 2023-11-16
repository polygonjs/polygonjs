export enum MouseButton {
	LEFT = 0,
	MIDDLE = 1,
	RIGHT = 2,
}
export enum MouseButtons {
	NONE = 0,
	LEFT = 1,
	RIGHT = 2,
	LEFT_RIGHT = 3,
	MIDDLE = 4,
	LEFT_MIDDLE = 5,
	MIDDLE_RIGHT = 6,
	LEFT_MIDDLE_RIGHT = 7,
}
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
export const MOUSE_BUTTONS: MouseButton[][] = [
	/*0*/ [],
	/*1*/ [MouseButton.LEFT],
	/*2*/ [MouseButton.RIGHT],
	/*3*/ [MouseButton.LEFT, MouseButton.RIGHT],
	/*4*/ [MouseButton.MIDDLE],
	/*5*/ [MouseButton.LEFT, MouseButton.MIDDLE],
	/*6*/ [MouseButton.MIDDLE, MouseButton.RIGHT],
	/*7*/ [MouseButton.LEFT, MouseButton.MIDDLE, MouseButton.RIGHT],
];
