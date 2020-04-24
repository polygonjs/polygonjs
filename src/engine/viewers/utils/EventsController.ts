import {BaseViewerType} from '../_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';

// type MouseOrTouchEvent = MouseEvent | TouchEvent;
type MouseOrTouchEventCallback = (e: MouseEvent) => void;

export class ViewerEventsController {
	protected _bound_on_mousedown: MouseOrTouchEventCallback = this.process_event.bind(this);
	protected _bound_on_mousemove: MouseOrTouchEventCallback = this.process_event.bind(this);
	protected _bound_on_mouseup: MouseOrTouchEventCallback = this.process_event.bind(this);

	constructor(protected viewer: BaseViewerType) {}

	get camera_node() {
		return this.viewer.cameras_controller.camera_node;
	}
	get canvas() {
		return this.viewer.canvas;
	}

	init() {
		if (!this.canvas) {
			return;
		}
		if (this._bound_on_mousedown) {
			this.canvas.removeEventListener('mousedown', this._bound_on_mousedown);
		}
		if (this._bound_on_mousemove) {
			this.canvas.removeEventListener('mousemove', this._bound_on_mousemove);
		}
		if (this._bound_on_mouseup) {
			this.canvas.removeEventListener('mouseup', this._bound_on_mouseup);
		}

		this.canvas.addEventListener('mousedown', this._bound_on_mousedown);
		this.canvas.addEventListener('mousemove', this._bound_on_mousemove);
		this.canvas.addEventListener('mouseup', this._bound_on_mouseup);

		// this._bound_on_touchmove = this._bound_on_touchmove || this._on_touchmove.bind(this)
		// this.canvas.addEventListener('touchstart', this._bound_on_mousedown, {passive: true});
		// this.canvas.addEventListener('touchmove', this._bound_on_mousemove, {passive: true});
		// this.canvas.addEventListener('touchend', this._bound_on_mouseup, {passive: true});
		// this.canvas.addEventListener('touchcancel', this._bound_on_mouseup, {passive: true});
	}

	private process_event(event: MouseEvent) {
		if (!this.canvas) {
			return;
		}
		const event_context: EventContext<MouseEvent> = {
			event: event,
			canvas: this.canvas,
			camera_node: this.camera_node,
		};
		this.viewer.scene.events_dispatcher.process_event(event_context);
	}
}
