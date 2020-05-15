import {MapboxViewer} from '../../Mapbox';

export class MapboxViewerEventsController {
	constructor(private _viewer: MapboxViewer) {}
	init_events() {
		const map = this._viewer.map;
		if (!map) {
			return;
		}
		map.on('move', this._on_move.bind(this));
		map.on('moveend', this._on_moveend.bind(this));

		map.on('mousemove', this._on_mousemove.bind(this));
		map.on('mousedown', this._on_mousedown.bind(this));
		map.on('mouseup', this._on_mouseup.bind(this));
	}

	private _on_move(e: Event) {}
	private _on_moveend(e: Event) {
		this.camera_node_move_end();
	}
	private _on_mousemove(e: MouseEvent) {}

	private _on_mousedown(e: MouseEvent) {}

	private _on_mouseup(e: MouseEvent) {}

	camera_node_move_end() {
		this._viewer.camera_node?.on_move_end(this._viewer.canvas_container);
	}
}
