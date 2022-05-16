export function triggerPointerdownInMiddle(canvas: HTMLCanvasElement) {
	const rect = canvas.getBoundingClientRect();
	canvas.dispatchEvent(
		new PointerEvent('pointerdown', {clientX: rect.left + rect.width * 0.5, clientY: rect.top + rect.height * 0.5})
	);
}
export function triggerPointerdownAside(canvas: HTMLCanvasElement) {
	canvas.dispatchEvent(new PointerEvent('pointerdown', {clientX: 0, clientY: 0}));
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
