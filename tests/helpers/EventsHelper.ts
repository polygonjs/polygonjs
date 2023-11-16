import {Vector2} from 'three';
import {CoreSleep} from '../../src/core/Sleep';
import {MouseButton, MouseButtons} from '../../src/core/MouseButton';

interface EventPos {
	x: number;
	y: number;
}
interface EventOptions {
	offset?: Vector2;
	emitter?: HTMLElement | Document;
	button?: MouseButton;
	buttons?: MouseButtons;
}
interface MouseEventOptions extends Partial<EventPos> {
	button?: MouseButton;
	buttons?: MouseButtons;
}
function rectElement(emitter: HTMLElement | Document) {
	const sizeElement = emitter instanceof Document ? document.body : emitter;
	const rect = sizeElement.getBoundingClientRect();
	return rect;
}

type MouseEventName = 'mousemove' | 'mousedown' | 'mouseup';
type PointerEventName = 'pointermove' | 'pointerdown' | 'pointerup' | 'click' | 'contextmenu';
function triggerMouseEvent(eventName: MouseEventName, emitter: HTMLElement | Document, options?: MouseEventOptions) {
	const offsetX = options?.x != null ? options.x : 0;
	const offsetY = options?.y != null ? options.y : 0;
	const rect = rectElement(emitter);
	const x = rect.left + rect.width * (0.5 + offsetX);
	const y = rect.top + rect.height * (0.5 + offsetY);
	emitter.dispatchEvent(
		new MouseEvent(eventName, {
			clientX: x,
			clientY: y,
			button: options?.button != null ? options.button : MouseButton.LEFT,
			buttons: options?.buttons != null ? options.buttons : MouseButtons.LEFT,
		})
	);
}
function triggerPointerEvent(eventName: PointerEventName, emitter: HTMLElement | Document, options?: EventPos) {
	const offsetX = options?.x != null ? options.x : 0;
	const offsetY = options?.y != null ? options.y : 0;
	const rect = rectElement(emitter);
	const x = rect.left + rect.width * (0.5 + offsetX);
	const y = rect.top + rect.height * (0.5 + offsetY);
	emitter.dispatchEvent(new PointerEvent(eventName, {clientX: x, clientY: y}));
}

function triggerMouseEventInMiddle(eventName: MouseEventName, element: HTMLElement | Document, options?: EventOptions) {
	const elementRect = rectElement(element);
	const event = new MouseEvent(eventName, {
		clientX: elementRect.left + elementRect.width * 0.5 + (options?.offset ? options.offset.x : 0),
		clientY: elementRect.top + elementRect.height * 0.5 + (options?.offset ? options.offset.y : 0),
		button: options?.button != null ? options.button : MouseButton.LEFT,
		buttons: options?.buttons != null ? options.buttons : MouseButtons.LEFT,
	});
	const emitter = options?.emitter || element;
	// const emitterRect = rectElement(emitter);
	// console.log({emitter, elementRect, emitterRect, clientX: event.clientX, clientY: event.clientY});

	emitter.dispatchEvent(event);
}
function triggerPointerEventInMiddle(
	eventName: PointerEventName,
	element: HTMLElement | Document,
	options?: EventOptions
) {
	const elementRect = rectElement(element);
	const event = new PointerEvent(eventName, {
		clientX: elementRect.left + elementRect.width * 0.5 + (options?.offset ? options.offset.x : 0),
		clientY: elementRect.top + elementRect.height * 0.5 + (options?.offset ? options.offset.y : 0),
		button: options?.button != null ? options.button : MouseButton.LEFT,
	});
	const emitter = options?.emitter || element;
	// const emitterRect = rectElement(emitter);
	// console.log({emitter, elementRect, emitterRect, clientX: event.clientX, clientY: event.clientY});

	emitter.dispatchEvent(event);
}
function triggerMouseEventAside(eventName: MouseEventName, element: HTMLElement | Document, options?: EventOptions) {
	const event = new MouseEvent(eventName, {
		clientX: 0,
		clientY: 0,
		button: options?.button != null ? options.button : MouseButton.LEFT,
	});
	element.dispatchEvent(event);
}
function triggerPointerEventAside(
	eventName: PointerEventName,
	element: HTMLElement | Document,
	options?: EventOptions
) {
	const event = new PointerEvent(eventName, {
		clientX: 0,
		clientY: 0,
		button: options?.button != null ? options.button : MouseButton.LEFT,
	});
	element.dispatchEvent(event);
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
	triggerPointerEventInMiddle('pointerdown', canvas, {offset});
}
export function triggerPointerdownAside(canvas: HTMLCanvasElement) {
	triggerPointerEventAside('pointerdown', canvas);
}
// pointerup
export function triggerPointerup(canvas: HTMLElement | Document, options?: EventPos) {
	triggerPointerEvent('pointerup', canvas, options);
}
export function triggerPointerupInMiddle(
	element: HTMLElement | Document,
	offset?: Vector2,
	emitter?: HTMLElement | Document
) {
	triggerPointerEventInMiddle('pointerup', element, {offset, emitter});
}
export function triggerPointerupAside(canvas: HTMLElement | Document) {
	triggerPointerEventAside('pointerup', canvas);
}
// pointerdown and pointerup
export async function triggerMousedownAndMouseup(canvas: HTMLCanvasElement, options?: MouseEventOptions) {
	triggerMouseEvent('mousedown', canvas, options);
	await CoreSleep.sleep(100);
	triggerMouseEvent('mouseup', document, options);
}
export async function triggerPointerdownAndPointerup(canvas: HTMLCanvasElement, options?: EventPos) {
	triggerPointerEvent('pointerdown', canvas, options);
	await CoreSleep.sleep(100);
	triggerPointerEvent('pointerup', document, options);
}
export async function triggerMousedownAndMouseupInMiddle(canvas: HTMLCanvasElement, options?: MouseEventOptions) {
	// triggerPointerEventInMiddle('click', canvas);
	triggerMouseEventInMiddle('mousedown', canvas, options);
	await CoreSleep.sleep(100);
	triggerMouseEventInMiddle('mouseup', document, options);
}
export async function triggerPointerdownAndPointerupInMiddle(canvas: HTMLCanvasElement, button?: MouseButton) {
	// triggerPointerEventInMiddle('click', canvas);
	triggerPointerEventInMiddle('pointerdown', canvas, {button});
	await CoreSleep.sleep(100);
	triggerPointerEventInMiddle('pointerup', document, {button});
}
export async function triggerMousedownAndMouseupAside(canvas: HTMLCanvasElement, options?: MouseEventOptions) {
	triggerMouseEventAside('mousedown', canvas, options);
	await CoreSleep.sleep(100);
	triggerMouseEventAside('mouseup', canvas, options);
}
export async function triggerPointerdownAndPointerupAside(canvas: HTMLCanvasElement, button?: MouseButton) {
	triggerPointerEventAside('pointerdown', canvas, {button});
	await CoreSleep.sleep(100);
	triggerPointerEventAside('pointerup', canvas, {button});
}
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
