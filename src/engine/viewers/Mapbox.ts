import {PolyScene} from '../scene/PolyScene';
import {MapboxCameraObjNode} from '../nodes/obj/MapboxCamera';

import {TypedViewer} from './_Base';
import {MapboxViewerEventsController} from './mapbox/controllers/Event';
import {MapboxViewerStylesheetController} from './mapbox/controllers/Stylesheet';

import mapboxgl from 'mapbox-gl';
import {MapboxViewerLayersController} from './mapbox/controllers/Layers';
import {MapsRegister} from '../../core/mapbox/MapsRegister';
const CSS_CLASS = 'CoreMapboxViewer';

export class MapboxViewer extends TypedViewer<MapboxCameraObjNode> {
	private _canvas_container: HTMLElement;
	// private _canvas: HTMLCanvasElement | undefined;
	// private _camera_node: MapboxCameraObjNode | undefined;

	private _map: mapboxgl.Map;
	private _map_loaded: boolean = false;

	// controllers
	public readonly layers_controller = new MapboxViewerLayersController(this);
	public readonly mapbox_events_controller = new MapboxViewerEventsController(this);

	constructor(
		protected _element: HTMLElement,
		protected _scene: PolyScene,
		protected _camera_node: MapboxCameraObjNode
	) {
		super(_element, _scene, _camera_node);

		MapboxViewerStylesheetController.load();
		this._canvas_container = document.createElement('div');
		this._element.appendChild(this._canvas_container);
		this._element.classList.add(CSS_CLASS);
		this._canvas_container.id = `mapbox_container_id_${Math.random()}`.replace('.', '_');
		this._canvas_container.style.height = '100%';
		this._map = this._camera_node.create_map(this._canvas_container);

		this.mapbox_events_controller.init_events();
		this._map.on('load', () => {
			if (this._map) {
				this._map_loaded = true;
				this._canvas = this.find_canvas();
				MapsRegister.instance().register_map(this._canvas_container.id, this._map);
				this.layers_controller.add_layers();
				this.mapbox_events_controller.camera_node_move_end(); // to update mapbox planes
			}
			// this.$store.app.dispatch_event(this.current_camera_node, {map_loaded: @panel_id.join('')})
		});
	}
	get map_loaded() {
		return this._map_loaded;
	}
	get map() {
		return this._map;
	}
	get camera_node() {
		return this._camera_node;
	}
	get canvas_container() {
		return this._canvas_container;
	}

	on_resize() {
		if (this._map) {
			this._map.resize();
		}
		this.layers_controller.resize();
		this.mapbox_events_controller.camera_node_move_end(); // to update mapbox planes
	}
	dispose() {
		MapsRegister.instance().deregister_map(this._canvas_container.id);
		this._camera_node?.remove_map(this._canvas_container);
		super.dispose();
	}

	wait_for_map_loaded() {
		if (this._map.loaded()) {
			return;
		} else {
			return new Promise((resolve, reject) => {
				if (this._map) {
					this._map.on('load', () => {
						resolve();
					});
				}
			});
		}
	}
	// canvas(): HTMLCanvasElement {
	// 	return this._canvas;
	// }
	camera_lng_lat() {
		return this._camera_node?.lng_lat();
	}

	_add_navigation_controls() {
		const nav = new mapboxgl.NavigationControl();
		this._map?.addControl(nav, 'bottom-right');
	}

	find_canvas() {
		return this._canvas_container.getElementsByTagName('canvas')[0];
	}
}
