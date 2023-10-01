export enum ScrollEvent {
	onUpdate = 'onUpdate',
	onToggle = 'onToggle',
	onEnter = 'onEnter',
	onLeave = 'onLeave',
	onEnterBack = 'onEnterBack',
	onLeaveBack = 'onLeaveBack',
}
export const SCROLL_EVENTS: ScrollEvent[] = [
	ScrollEvent.onUpdate,
	ScrollEvent.onToggle,
	ScrollEvent.onEnter,
	ScrollEvent.onLeave,
	ScrollEvent.onEnterBack,
	ScrollEvent.onLeaveBack,
];
export type ScrollEventListener = () => void;
export interface CreateScrollTriggerOptions {
	element: string;
	useViewport: boolean;
	scroller: string;
	displayMarkers: boolean;
	nodePath: string;
}
export interface CreateScrollTriggerOptionsSerialized {
	element: string;
	useViewport: string;
	scroller: string;
	displayMarkers: string;
	nodePath: string;
}
export type CallbackByScrollEvent = Record<ScrollEvent, ScrollEventListener>;
