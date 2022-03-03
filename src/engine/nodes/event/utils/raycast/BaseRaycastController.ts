import {Vector2} from 'three/src/math/Vector2';
import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {MouseHelper, CursorOffset} from './MouseHelper';

export class BaseRaycastController {
	private _offset: CursorOffset = {offsetX: 0, offsetY: 0};
	protected _cursor: Vector2 = new Vector2();

	protected _setCursor(context: EventContext<MouseEvent | DragEvent | PointerEvent | TouchEvent>) {
		const canvas = context.viewer?.canvas();
		if (!canvas) {
			return;
		}

		const event = context.event;
		if (event instanceof MouseEvent || event instanceof DragEvent || event instanceof PointerEvent) {
			MouseHelper.setEventOffset(event, canvas, this._offset);
		}
		if (
			window.TouchEvent /* check first that TouchEvent is defined, since it does on firefox desktop */ &&
			event instanceof TouchEvent
		) {
			const touch = event.touches[0];
			MouseHelper.setEventOffset(touch, canvas, this._offset);
		}
		this._updateFromCursor(canvas);
	}
	private _updateFromCursor(canvas: HTMLCanvasElement) {
		if (canvas.offsetWidth <= 0 || canvas.offsetHeight <= 0) {
			// the canvas can have a size of 0 if it has been removed from the scene
			this._cursor.set(0, 0);
		} else {
			this._cursor.x = this._offset.offsetX / canvas.offsetWidth;
			this._cursor.y = this._offset.offsetY / canvas.offsetHeight;
			this._remapCursor();
		}
		// there can be some conditions leading to an infinite mouse number, so we check here what we got
		if (isNaN(this._cursor.x) || !isFinite(this._cursor.x) || isNaN(this._cursor.y) || !isFinite(this._cursor.y)) {
			console.warn('invalid number detected');
			console.warn(
				this._cursor.toArray(),
				this._offset.offsetX,
				this._offset.offsetY,
				canvas.offsetWidth,
				canvas.offsetHeight
			);
			return;
		}
	}
	protected _remapCursor() {}
}
