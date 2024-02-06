import type {Vector2} from 'three';
import {isVector2Valid} from '../Vector';
import type {EventContext} from './EventContextType';
import {CursorOffset, MouseHelper} from './MouseHelper';

const _offset: CursorOffset = {offsetX: 0, offsetY: 0};

export class CursorHelper {
	setCursorForCPU(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>, target: Vector2) {
		this.setCursor(context, target);
		target.x = target.x * 2 - 1;
		target.y = -target.y * 2 + 1;
	}
	setCursorForGPU(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>, target: Vector2) {
		this.setCursor(context, target);
		target.y = 1 - target.y;
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
			// no touch for touchend events
			if (touch) {
				MouseHelper.setEventOffset(touch, canvas, _offset);
			}
		}
		this._updateFromCursor(canvas, target);
	}
	private _updateFromCursor(canvas: HTMLCanvasElement, target: Vector2) {
		if (canvas.offsetWidth <= 0 || canvas.offsetHeight <= 0) {
			console.warn('_updateFromCursor: zero size canvas');
			// the canvas can have a size of 0 if it has been removed from the scene
			target.set(0, 0);
		} else {
			target.x = _offset.offsetX / canvas.offsetWidth;
			target.y = _offset.offsetY / canvas.offsetHeight;
			// this._remapCursor();
		}
		// there can be some conditions leading to an infinite mouse number, so we check here what we got
		if (!isVector2Valid(target)) {
			console.warn('invalid number detected');
			console.warn(target.toArray(), _offset.offsetX, _offset.offsetY, canvas.offsetWidth, canvas.offsetHeight);
			return;
		}
	}
}
