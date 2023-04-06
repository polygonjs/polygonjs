// https://developer.mozilla.org/en-US/docs/Web/Events
export enum PointerEventType {
	click = 'click',
	pointerdown = 'pointerdown',
	pointermove = 'pointermove',
	pointerup = 'pointerup',
}

export const ACCEPTED_POINTER_EVENT_TYPES: PointerEventType[] = [
	PointerEventType.click,
	PointerEventType.pointerdown,
	PointerEventType.pointermove,
	PointerEventType.pointerup,
];
