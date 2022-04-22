import {Vector2} from 'three';
import {CoreVector} from '../../../../core/Vector';
import {EventContext} from '../../../scene/utils/events/_BaseEventsController';

export interface CursorOffset {
	offsetX: number;
	offsetY: number;
}
export interface CursorPage {
	clientX: number;
	clientY: number;
}

class MouseHelperClass {
	private static _instance: MouseHelperClass;

	static instance() {
		return (this._instance = this._instance || new MouseHelperClass());
	}
	private constructor() {
		window.addEventListener('resize', this._resetCacheBound);
		document.addEventListener('scroll', this._resetCacheBound);
	}
	private _rectByCanvas: Map<HTMLCanvasElement, DOMRect> = new Map();

	setEventOffset(cursorPage: CursorPage, canvas: HTMLCanvasElement, offset: CursorOffset) {
		let rect = this._rectByCanvas.get(canvas);
		if (!rect) {
			rect = canvas.getBoundingClientRect();
			this._rectByCanvas.set(canvas, rect);
		}
		// this function used to use cursorPage.pageX/pageY
		// but this was returning an incorrect position when the page was scrolled
		offset.offsetX = cursorPage.clientX - rect.left;
		offset.offsetY = cursorPage.clientY - rect.top;
	}

	private _resetCacheBound = this._resetCache.bind(this);
	private _resetCache() {
		this._rectByCanvas.clear();
	}
}

const MouseHelper = MouseHelperClass.instance();

const _offset: CursorOffset = {offsetX: 0, offsetY: 0};

export class CursorHelper {
	// protected _cursor: Vector2 = new Vector2();

	setCursorForCPU(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>, target: Vector2) {
		this.setCursor(context, target);
		target.x = target.x * 2 - 1;
		target.y = -target.y * 2 + 1;
	}
	setCursorForGPU(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>, target: Vector2) {
		this.setCursor(context, target);
	}

	private setCursor(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>, target: Vector2) {
		const canvas = context.viewer?.canvas();
		if (!canvas) {
			return;
		}

		const event = context.event;
		if (event instanceof PointerEvent || event instanceof MouseEvent || event instanceof DragEvent) {
			MouseHelper.setEventOffset(event, canvas, _offset);
		}
		if (
			window.TouchEvent /* check first that TouchEvent is defined, since it does on firefox desktop */ &&
			event instanceof TouchEvent
		) {
			const touch = event.touches[0];
			MouseHelper.setEventOffset(touch, canvas, _offset);
		}
		this._updateFromCursor(canvas, target);
	}
	private _updateFromCursor(canvas: HTMLCanvasElement, target: Vector2) {
		if (canvas.offsetWidth <= 0 || canvas.offsetHeight <= 0) {
			// the canvas can have a size of 0 if it has been removed from the scene
			target.set(0, 0);
		} else {
			target.x = _offset.offsetX / canvas.offsetWidth;
			target.y = _offset.offsetY / canvas.offsetHeight;
			// this._remapCursor();
		}
		// there can be some conditions leading to an infinite mouse number, so we check here what we got
		if (!CoreVector.isVector2Valid(target)) {
			console.warn('invalid number detected');
			console.warn(target.toArray(), _offset.offsetX, _offset.offsetY, canvas.offsetWidth, canvas.offsetHeight);
			return;
		}
	}
	// protected _remapCursor() {}
}
