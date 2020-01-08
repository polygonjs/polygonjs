import {BaseViewer} from '../_Base';

export class EventsController {
	private _mousedown_pos: Vector2Components;
	private _mouse_distance_travelled: number = null;
	constructor(protected viewer: BaseViewer) {}

	protected _on_mousedown(event: MouseEvent) {
		this._mouse_distance_travelled = 0;
		this._mousedown_pos.x = event.pageX;
		this._mousedown_pos.y = event.pageY;
	}

	protected _on_mousemove(event: MouseEvent) {
		if (this._mouse_distance_travelled !== null) {
			this._mouse_distance_travelled += Math.abs(
				event.pageX - this._mousedown_pos.x + (event.pageY - this._mousedown_pos.y)
			);
		}

		if (!this._controls_active) {
			this.self.process_picker_nodes_on_mouse_move(event, this.current_camera, this.ray_helper);
		}
	}

	protected _on_mouseup(event: MouseEvent) {
		if (this._mouse_distance_travelled < 2) {
			this.self.process_picker_nodes_on_click(event, this.current_camera, this.ray_helper);
		}
		this._mouse_distance_travelled = null;
	}
}
