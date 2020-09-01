import {MapboxViewer} from '../../Mapbox';
import {ThreejsLayer} from '../layers/Threejs';
import {BuildingsLayer} from '../layers/Buildings';

export class MapboxViewerLayersController {
	public _threejs_layer: ThreejsLayer | undefined;
	constructor(private _viewer: MapboxViewer) {}

	get threejs_layer() {
		return this._threejs_layer;
	}

	add_layers() {
		if (this._viewer.map_loaded != true) {
			return;
		}
		if (!this._viewer.map) {
			return;
		}
		//return if @_adding_layers == true
		//@_adding_layers = true

		const current_style = this._viewer.map.getStyle();
		const layers = current_style.layers;
		if (!layers) {
			return;
		}

		let label_layer_id = null;
		for (let layer of layers) {
			if (layer.type == 'symbol' && (layer.layout as mapboxgl.SymbolLayout)['text-field']) {
				label_layer_id = layer.id;
			}
		}

		if (label_layer_id != null) {
			this._add_buildings_layer(label_layer_id);
			this._add_threejs_layer(label_layer_id);
		}

		//@_adding_layers = false
	}
	resize() {
		if (this._threejs_layer) {
			this._threejs_layer.resize();
		}
	}
	_add_buildings_layer(label_layer_id: string) {
		if (this._has_layer_id(BuildingsLayer.id)) {
			return;
		}

		if (this._viewer.map) {
			this._viewer.map.addLayer(BuildingsLayer, label_layer_id);
		}
	}

	_add_threejs_layer(label_layer_id: string) {
		//return if this._has_layer_id(ThreejsLayer.ID)

		//if !@_map.getLayer(ThreejsLayer.ID)?
		//sprite = @_map.getStyle()['sprite']

		//@_has_added_threejs_layer_by_style ?= {}
		//if @_has_added_threejs_layer_by_style[sprite] == true
		//	@_map.removeLayer(ThreejsLayer.ID)

		//if @_has_added_threejs_layer_by_style[sprite] != true
		// display_scene = this.$store.scene.display_scene()
		// const line_precision_mult = 1; //0.0001
		// this._init_ray_helper(line_precision_mult); //this._canvas_container, this._display_scene, line_precision_mult)
		if (!this._viewer.camera_node) {
			return;
		}
		this._threejs_layer = new ThreejsLayer(
			this._viewer.camera_node,
			this._viewer.camera_node.scene.default_scene,
			this._viewer
		);
		if (this._threejs_layer && this._viewer.map) {
			// @_map.setPaintProperty(label_layer_id, 'opacity', 0.5)
			/*const layer = */ this._viewer.map.addLayer(this._threejs_layer, label_layer_id);
		}
		//@_has_added_threejs_layer_by_style[sprite] = true
	}
	_has_layer_id(layer_id: string): boolean {
		if (this._viewer.map) {
			const current_style = this._viewer.map.getStyle();
			const layer_ids = current_style.layers?.map((l) => l.id) || [];
			return layer_ids.includes(layer_id);
		}
		return false;
	}
}
