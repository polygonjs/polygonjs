import mapboxgl from 'mapbox-gl';
import {ThreejsLayer, ThreejsLayerOptions, ThreejsLayerRenderFunc} from './layers/MapboxThreejsLayer';
import {BuildingsLayer} from './layers/Buildings';
import {
	// Vector2,
	Scene,
	Camera,
} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {LngLat} from './Common';
import {MapboxViewer} from '../../../engine/viewers/Mapbox';

export interface LayersOptions {
	map: mapboxgl.Map;
	scene: PolyScene;
	camera: Camera;
	displayScene: Scene;
	lngLat: LngLat;
	renderFunc: ThreejsLayerRenderFunc;
	viewer: MapboxViewer;
	zoomControls: boolean;
	layer3D: boolean;
	layerBuildings: boolean;
	layerSky: boolean;
}

export class MapboxLayersController {
	public _threejsLayer: ThreejsLayer | undefined;
	constructor(private _options: LayersOptions) {}

	addLayers() {
		// if (!this._viewer.mapLoaded()) {
		// 	console.warn('map not loaded');
		// 	return;
		// }
		// const map = this._viewer.map();
		// if (!map) {
		// 	console.warn('no map found');
		// 	return;
		// }

		const current_style = this._options.map.getStyle();
		const layers = current_style.layers;
		if (!layers) {
			console.warn('no layers found');
			return;
		}

		let label_layer_id = null;
		for (const layer of layers) {
			if (layer.type == 'symbol' && (layer.layout as mapboxgl.SymbolLayout)['text-field']) {
				label_layer_id = layer.id;
			}
		}
		// const cameraNode = this._viewer.cameraNode();

		if (label_layer_id != null) {
			this._addLayerBuildings(label_layer_id);
			this._addLayerThreejs(label_layer_id);
		}

		this._addLayer3D();
		this._addLayerSky();
		this._addZoomControls();
	}
	// resize(size: Vector2) {
	// 	this._threejsLayer?.resize(size);
	// }
	private _addZoomControls() {
		if (!this._options.zoomControls) {
			return;
		}
		// let nav_control = this._controls_by_container_id.get(container_id);
		// if (nav_control) {
		// 	if (!isBooleanTrue(this.pv.addZoomControl)) {
		// 		map.removeControl(nav_control);
		// 		this._controls_by_container_id.delete(container_id);
		// 	}
		// } else {
		// 	if (isBooleanTrue(this.pv.addZoomControl)) {
		const navControl = new mapboxgl.NavigationControl();
		this._options.map.addControl(navControl, 'bottom-right');
		// this._controls_by_container_id.set(container_id, nav_control);
		// }
		// }
	}
	protected _addLayer3D() {
		if (!this._options.layer3D) {
			return;
		}

		if (this._options.displayScene.background != null) {
			console.warn(
				'the scene has the background set, which may prevent the layers from displaying correctly. Make sure to remove the background.'
			);
		}

		this._options.map.addSource('mapbox-dem', {
			type: 'raster-dem',
			url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
			tileSize: 512,
			maxzoom: 14,
		});
		// add the DEM source as a terrain layer with exaggerated height
		this._options.map.setTerrain({source: 'mapbox-dem', exaggeration: 1.5});
	}
	private _addLayerSky() {
		if (!this._options.layerSky) {
			return;
		}
		// add a sky layer that will show when the map is highly pitched
		this._options.map.addLayer({
			id: 'sky',
			type: 'sky',
			paint: {
				'sky-type': 'atmosphere',
				'sky-atmosphere-sun': [0.0, 0.0],
				'sky-atmosphere-sun-intensity': 15,
			},
		});
	}
	private _addLayerBuildings(label_layer_id: string) {
		if (!this._options.layerBuildings) {
			return;
		}

		if (this._hasLayerId(BuildingsLayer.id)) {
			return;
		}
		this._options.map.addLayer(BuildingsLayer, label_layer_id);
	}

	protected _addLayerThreejs(label_layer_id: string) {
		const options: ThreejsLayerOptions = {
			map: this._options.map,
			scene: this._options.scene,
			camera: this._options.camera,
			canvas: this._options.map.getCanvas(),
			lngLat: this._options.lngLat,
			renderFunc: this._options.renderFunc,
			viewer: this._options.viewer,
		};
		this._threejsLayer = new ThreejsLayer(options);
		this._options.map.addLayer(this._threejsLayer, label_layer_id);
		// const threejsScene = camera_node.scene().threejsScene();
		// const layer = Threejs3LayerBuilder(threejsScene);
		// map.addLayer(layer, label_layer_id);
	}
	private _hasLayerId(layer_id: string): boolean {
		const current_style = this._options.map.getStyle();
		const layer_ids = current_style.layers?.map((l) => l.id) || [];
		return layer_ids.includes(layer_id);
	}
}
