import {Vector2} from 'three';
import {CoreSleep} from '../../src/core/Sleep';

interface EventPos {
	x: number;
	y: number;
}

type PointerEventName = 'pointermove' | 'pointerdown' | 'pointerup' | 'click' | 'contextmenu';
function triggerPointerEvent(eventName: PointerEventName, emitter: HTMLElement | Document, options?: EventPos) {
	const offsetX = options?.x != null ? options.x : 0;
	const offsetY = options?.y != null ? options.y : 0;
	const sizeElement = emitter instanceof Document ? document.body : emitter;
	const rect = sizeElement.getBoundingClientRect();
	const x = rect.left + rect.width * (0.5 + offsetX);
	const y = rect.top + rect.height * (0.5 + offsetY);
	emitter.dispatchEvent(new PointerEvent(eventName, {clientX: x, clientY: y}));
}
function triggerPointerEventInMiddle(eventName: PointerEventName, emitter: HTMLElement | Document, offset?: Vector2) {
	const sizeElement = emitter instanceof Document ? document.body : emitter;
	const rect = sizeElement.getBoundingClientRect();
	emitter.dispatchEvent(
		new PointerEvent(eventName, {
			clientX: rect.left + rect.width * 0.5 + (offset ? offset.x : 0),
			clientY: rect.top + rect.height * 0.5 + (offset ? offset.y : 0),
		})
	);
}
function triggerPointerEventAside(eventName: PointerEventName, canvas: HTMLCanvasElement) {
	canvas.dispatchEvent(new PointerEvent(eventName, {clientX: 0, clientY: 0}));
}

// pointermove
export function triggerPointermove(canvas: HTMLCanvasElement, options?: EventPos) {
	triggerPointerEvent('pointermove', canvas, options);
}
export function triggerPointermoveInMiddle(canvas: HTMLCanvasElement) {
	triggerPointerEventInMiddle('pointermove', canvas);
}
export function triggerPointermoveAside(canvas: HTMLCanvasElement) {
	triggerPointerEventAside('pointermove', canvas);
}
// pointerdown
export function triggerPointerdown(canvas: HTMLCanvasElement, options?: EventPos) {
	triggerPointerEvent('pointerdown', canvas, options);
}
export function triggerPointerdownInMiddle(canvas: HTMLCanvasElement, offset?: Vector2) {
	triggerPointerEventInMiddle('pointerdown', canvas, offset);
}
export function triggerPointerdownAside(canvas: HTMLCanvasElement) {
	triggerPointerEventAside('pointerdown', canvas);
}
// pointerup
export function triggerPointerup(canvas: HTMLCanvasElement, options?: EventPos) {
	triggerPointerEvent('pointerup', canvas, options);
}
export function triggerPointerupInMiddle(canvas: HTMLCanvasElement, offset?: Vector2) {
	triggerPointerEventInMiddle('pointerup', canvas, offset);
}
export function triggerPointerupAside(canvas: HTMLCanvasElement) {
	triggerPointerEventAside('pointerup', canvas);
}
// pointerdown and pointerup
export async function triggerPointerdownAndPointerup(canvas: HTMLCanvasElement, options?: EventPos) {
	triggerPointerEvent('pointerdown', canvas, options);
	await CoreSleep.sleep(100);
	triggerPointerEvent('pointerup', document, options);
}
export async function triggerPointerdownAndPointerupInMiddle(canvas: HTMLCanvasElement) {
	// triggerPointerEventInMiddle('click', canvas);
	triggerPointerEventInMiddle('pointerdown', canvas);
	await CoreSleep.sleep(100);
	triggerPointerEventInMiddle('pointerup', document);
}
export async function triggerPointerdownAndPointerupAside(canvas: HTMLCanvasElement) {
	triggerPointerEventAside('pointerdown', canvas);
	await CoreSleep.sleep(100);
	triggerPointerEventAside('pointerup', canvas);
}
// click
// export function triggerClick(canvas: HTMLCanvasElement, options?: EventPos) {
// 	triggerPointerEvent('click', canvas, options);
// }
// export function triggerClickInMiddle(canvas: HTMLCanvasElement) {
// 	triggerPointerEventInMiddle('click', canvas);
// }
// export function triggerClickAside(canvas: HTMLCanvasElement) {
// 	triggerPointerEventAside('click', canvas);
// }
// contextmenu
export function triggerContextMenu(canvas: HTMLCanvasElement, options?: EventPos) {
	triggerPointerEvent('contextmenu', canvas, options);
}
export function triggerContextMenuInMiddle(canvas: HTMLCanvasElement) {
	triggerPointerEventInMiddle('contextmenu', canvas);
}
export function triggerContextMenuAside(canvas: HTMLCanvasElement) {
	triggerPointerEventAside('contextmenu', canvas);
}

interface KeyEventOptions {
	code?: 'keyA' | 'keyE';
	ctrlKey?: boolean;
}
export function triggerKeydown(canvas: HTMLCanvasElement, options: KeyEventOptions = {}) {
	options.code = options.code || 'keyE';
	if (options.ctrlKey == null) {
		options.ctrlKey = false;
	}
	canvas.focus();
	canvas.dispatchEvent(new KeyboardEvent('keydown', options));
}

export function triggerKeypress(canvas: HTMLCanvasElement, options: KeyEventOptions = {}) {
	options.code = options.code || 'keyE';
	if (options.ctrlKey == null) {
		options.ctrlKey = false;
	}
	canvas.focus();
	canvas.dispatchEvent(new KeyboardEvent('keypress', options));
}
export function triggerKeyup(canvas: HTMLCanvasElement, options: KeyEventOptions = {}) {
	options.code = options.code || 'keyE';
	if (options.ctrlKey == null) {
		options.ctrlKey = false;
	}
	canvas.focus();
	canvas.dispatchEvent(new KeyboardEvent('keyup', options));
}
