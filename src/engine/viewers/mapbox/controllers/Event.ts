import {MapboxViewer} from '../../Mapbox';

export class MapboxViewerEventsController {
	// private _camera_updating: boolean = false;
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
	// current_camera() {
	// 	// this.current_camera_node.object()
	// 	// NOTE that I was previously giving the camera_node object
	// 	// to the picker nodes
	// 	// but it seems that I do not propagage well the threejs layer camera pos/rot/matrices
	// 	// to the camera node object, and therefore do not get accurate results in the picker
	// 	const layer = this._viewer.layers_controller.threejs_layer
	// 	if (layer) {
	// 		return layer.camera();
	// 	}
	// }
	private _on_move(e: Event) {
		// return (this._camera_updating = true);
	}
	private _on_moveend(e: Event) {
		// this._camera_updating = false;
		//console.log("on_moveend")
		this.camera_node_move_end();
	}
	private _on_mousemove(e: MouseEvent) {
		// console.log("on_mousemove - is_camera_updating", this.is_camera_updating())
		// if (!this.is_camera_updating()) {
		// 	if (this._camera) {
		// 		// return this.self.process_picker_nodes_on_mouse_move(
		// 		// 	event,
		// 		// 	this._camera,
		// 		// 	this.ray_helper
		// 		// );
		// 	}
		// }
	}
	// lnglat_cursor = e.lngLat
	// screen_pos = JSON.stringify(e.point)
	// long_lat_pos = JSON.stringify(e.lngLat)
	// world_pos = JSON.stringify(Core.Mapbox.Utils.fromLL(e.lngLat.lng, e.lngLat.lat))

	// #this.process_picker_nodes_on_mouse_move(e.originalEvent, this.current_camera, @ray_helper)
	// now = performance.now()
	// if !@_last_mouse_move_update? || (now - @_last_mouse_move_update) > 50
	// 	#this.$store.scene.set_auto_update(false)
	// 	#this.current_camera_node.param('lng_lat_mouse_move').set([lnglat_cursor.lng, lnglat_cursor.lat])
	// 	#this.$store.scene.set_auto_update(true)
	// 	#if @_node_street_id_mouse_move?
	// 	#	@_node_street_id_mouse_move.param('lng_lat').set([lnglat_cursor.lng, lnglat_cursor.lat])

	// 	@_last_mouse_move_update = now

	private _on_mousedown(e: MouseEvent) {}
	// camera_data = this._camera_options()
	// @_mouse_down_camera_data = camera_data

	private _on_mouseup(e: MouseEvent) {
		// console.log("on_mouseup - is_camera_updating", this.is_camera_updating())
		// if (!this.is_camera_updating()) {
		// 	return this.self.process_picker_nodes_on_click(
		// 		event,
		// 		this.current_camera,
		// 		this.ray_helper
		// 	);
		// }
	}

	camera_node_move_end() {
		this._viewer.camera_node?.on_move_end(this._viewer.canvas_container);
	}
}
