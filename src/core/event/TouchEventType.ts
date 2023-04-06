// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
export enum TouchEventType {
	touchstart = 'touchstart',
	touchmove = 'touchmove',
	touchend = 'touchend',
}
export const ACCEPTED_TOUCH_EVENT_TYPES: TouchEventType[] = [
	TouchEventType.touchstart,
	TouchEventType.touchmove,
	TouchEventType.touchend,
];
