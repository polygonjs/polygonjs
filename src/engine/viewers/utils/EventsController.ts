import {BaseViewer} from '../_Base';
import {Vector2} from 'three/src/math/Vector2';

const DIST_UNINITIALIZED = -1;
type MouseOrTouchEvent = MouseEvent | TouchEvent;
type MouseOrTouchEventCallback = (e: MouseOrTouchEvent) => void;

export class EventsController {
	private _mousedown_pos = new Vector2();
	private _mouse_distance_travelled: number = DIST_UNINITIALIZED;
	protected _bound_on_mousedown: MouseOrTouchEventCallback = this._on_mousedown.bind(this);
	protected _bound_on_mousemove: MouseOrTouchEventCallback = this._on_mousemove.bind(this);
	protected _bound_on_mouseup: MouseOrTouchEventCallback = this._on_mouseup.bind(this);
	// protected _bound_on_click: MouseEventCallback

	constructor(protected viewer: BaseViewer) {}

	get camera_node() {
		return this.viewer.cameras_controller.camera_node;
	}
	get canvas() {
		return this.viewer.canvas;
	}

	init() {
		if (this._bound_on_mousedown) {
			this.canvas.removeEventListener('mousedown', this._bound_on_mousedown);
		}
		if (this._bound_on_mousemove) {
			this.canvas.removeEventListener('mousemove', this._bound_on_mousemove);
		}
		if (this._bound_on_mouseup) {
			this.canvas.removeEventListener('mouseup', this._bound_on_mouseup);
		}
		this._bound_on_mousedown = this._bound_on_mousedown || this._on_mousedown.bind(this);
		this._bound_on_mousemove = this._bound_on_mousemove || this._on_mousemove.bind(this);
		this._bound_on_mouseup = this._bound_on_mouseup || this._on_mouseup.bind(this);

		this.canvas.addEventListener('mousedown', this._bound_on_mousedown);
		this.canvas.addEventListener('mousemove', this._bound_on_mousemove);
		this.canvas.addEventListener('mouseup', this._bound_on_mouseup);

		// this._bound_on_touchmove = this._bound_on_touchmove || this._on_touchmove.bind(this)
		this.canvas.addEventListener('touchstart', this._bound_on_mousedown, false);
		this.canvas.addEventListener('touchmove', this._bound_on_mousemove, false);
		this.canvas.addEventListener('touchend', this._bound_on_mouseup, false);
		this.canvas.addEventListener('touchcancel', this._bound_on_mouseup, false);
	}

	protected _on_mousedown(event: MouseOrTouchEvent) {
		this._mouse_distance_travelled = 0;
		if (event instanceof MouseEvent) {
			this._mousedown_pos.x = event.pageX;
			this._mousedown_pos.y = event.pageY;
		} else {
			const touch = event.touches[0];
			this._mousedown_pos.x = touch.pageX;
			this._mousedown_pos.y = touch.pageY;
		}
	}

	protected _on_mousemove(event: MouseOrTouchEvent) {
		if (this._mouse_distance_travelled !== DIST_UNINITIALIZED) {
			let distance: number = 0;
			if (event instanceof MouseEvent) {
				distance = event.pageX - this._mousedown_pos.x + (event.pageY - this._mousedown_pos.y);
			} else {
				const touch = event.touches[0];
				distance = touch.pageX - this._mousedown_pos.x + (touch.pageY - this._mousedown_pos.y);
			}
			this._mouse_distance_travelled += Math.abs(distance);
		}

		if (!this.viewer.controls_controller.active) {
			// this.viewer.process_picker_nodes_on_mouse_move(event, this.camera_node, this.ray_helper);
		}
	}

	protected _on_mouseup(event: MouseOrTouchEvent) {
		if (this._mouse_distance_travelled < 2) {
			// this.viewer.process_picker_nodes_on_click(event, this.camera_node, this.ray_helper);
		}
		this._mouse_distance_travelled = DIST_UNINITIALIZED;
	}
}
