// https://developer.mozilla.org/en-US/docs/Web/Events
export enum PointerEventType {
	click = 'click',
	pointerdown = 'pointerdown',
	pointermove = 'pointermove',
	pointerup = 'pointerup',
	touchstart = 'touchstart',
	touchmove = 'touchmove',
	touchend = 'touchend',
}

export const ONLY_POINTER_EVENT_TYPES: PointerEventType[] = [
	// PointerEventType.click, // no click for event/pointer
	PointerEventType.pointerdown,
	PointerEventType.pointermove,
	PointerEventType.pointerup,
];

export const ACCEPTED_POINTER_EVENT_TYPES: PointerEventType[] = [
	PointerEventType.click,
	PointerEventType.pointerdown,
	PointerEventType.pointermove,
	PointerEventType.pointerup,
];
