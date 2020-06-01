import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {TypedCameraObjNode, CameraMasterCameraParamConfig} from './_BaseCamera';

import mapboxgl from 'mapbox-gl';

import {MapboxViewer} from '../../viewers/Mapbox';
import {CoreMapboxClient} from '../../../core/mapbox/Client';

import {ParamConfig, NodeParamsConfig} from '..//utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
class MapboxCameraObjParamConfig extends CameraMasterCameraParamConfig(NodeParamsConfig) {
	style = ParamConfig.STRING('mapbox://styles/mapbox/dark-v10', {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_style(node as MapboxCameraObjNode);
		},
	});
	lng_lat = ParamConfig.VECTOR2([-0.07956, 51.5146], {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	zoom = ParamConfig.FLOAT(15.55, {
		range: [0, 24],
		range_locked: [true, true],
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	zoom_range = ParamConfig.VECTOR2([0, 24], {
		// range: [0, 24],
		// range_locked: [true, true]
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	pitch = ParamConfig.FLOAT(60, {
		range: [0, 60],
		range_locked: [true, true],
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	bearing = ParamConfig.FLOAT(60.373613, {
		range: [0, 360],
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	update_params_from_map = ParamConfig.BUTTON(null, {
		label: 'Set Navigation Params as Default',
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_params_from_map(node as MapboxCameraObjNode);
		},
	});
	allow_drag_rotate = ParamConfig.BOOLEAN(1, {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	add_zoom_control = ParamConfig.BOOLEAN(1, {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	// this.create_player_camera_params();
}
const ParamsConfig = new MapboxCameraObjParamConfig();

export class MapboxCameraObjNode extends TypedCameraObjNode<PerspectiveCamera, MapboxCameraObjParamConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'mapbox_camera'> {
		return 'mapbox_camera';
	}
	public integration_data() {
		return CoreMapboxClient.integration_data();
	}

	private _maps_by_container_id: Map<string, mapboxgl.Map> = new Map();
	private _map_containers_by_container_id: Map<string, HTMLElement> = new Map();
	private _canvases_by_container_id: Map<string, HTMLCanvasElement> = new Map();
	private _controls_by_container_id: Map<string, mapboxgl.NavigationControl> = new Map();
	private _moving_maps = false;

	create_object() {
		return new PerspectiveCamera(); // I use a PerspectiveCamera to have the picker working
	}

	async cook() {
		this.update_maps();
		this.cook_controller.end_cook();
	}

	// prepare_for_viewer: (aspect)->
	// 	#if (camera = this.object())?
	// 	#	#

	create_map(container: HTMLElement) {
		CoreMapboxClient.ensure_token_is_set();

		//this.param('lng_lat_at_start').set(@_start_lng_lat)
		const map = new mapboxgl.Map({
			style: this.pv.style,
			container,
			center: this.pv.lng_lat.toArray() as Number2,
			zoom: this.pv.zoom,
			minZoom: this.pv.zoom_range.x,
			maxZoom: this.pv.zoom_range.y,
			pitch: this.pv.pitch,
			bearing: this.pv.bearing,
			preserveDrawingBuffer: true,
			dragRotate: this.pv.allow_drag_rotate,
			pitchWithRotate: this.pv.allow_drag_rotate,
		});

		this._add_remove_controls(map, container.id);

		this._maps_by_container_id.set(container.id, map);
		this._map_containers_by_container_id.set(container.id, container);
		this._canvases_by_container_id.set(container.id, container.querySelector('canvas')!);

		return map;
	}

	// private _fetch_token(){
	// 	const token = POLY.mapbox_token()
	// 	if(token){
	// 		return token
	// 	} else {
	// 		const scene = this.scene();
	// 		const scene_uuid = scene.uuid();

	// 		let url;
	// 		if(scene_uuid){
	// 			url = `/api/scenes/${scene_uuid}/mapbox`;
	// 		} else {
	// 			// in case the scene has not been saved yet
	// 			url = `/api/account/mapbox_token`;
	// 		}

	// 		return new Promise((resolve, reject)=> {
	// 			axios.get(url).then((response)=>{
	// 				const token = response.data.token
	// 				POLY.register_mapbox_token(token)

	// 				resolve(token)
	// 			}).catch(()=>{
	// 				resolve()
	// 			})
	// 		})
	// 	}
	// }

	update_maps() {
		this._maps_by_container_id.forEach((map, container_id) => {
			this.update_map_from_container_id(container_id);
		});
	}

	//this.object().dispatchEvent('change')

	update_map_from_container_id(container_id: string) {
		const map = this._maps_by_container_id.get(container_id);
		if (!map) {
			return;
		}
		this.update_map_nav(map);
		// controls
		this._add_remove_controls(map, container_id);
		// style
		map.setStyle(this.pv.style);
	}
	update_map_nav(map: mapboxgl.Map) {
		// position/zoom/pitch/bearing
		map.jumpTo(this.camera_options_from_params());
		map.setMinZoom(this.pv.zoom_range.x);
		map.setMaxZoom(this.pv.zoom_range.y);

		const drag_rotate_handler = map.dragRotate;
		if (this.pv.allow_drag_rotate) {
			drag_rotate_handler.enable();
		} else {
			drag_rotate_handler.disable();
		}
	}

	first_map() {
		let first_map: mapboxgl.Map | undefined;
		this._maps_by_container_id.forEach((map, id) => {
			if (!first_map) {
				first_map = map;
			}
		});
		return first_map;
	}
	first_id() {
		let first_id: string | undefined;
		this._maps_by_container_id.forEach((map, id) => {
			if (!first_id) {
				first_id = id;
			}
		});
		return first_id;
	}
	first_map_element() {
		const id = this.first_id();
		if (id) {
			return this._map_containers_by_container_id.get(id);
		}
	}
	bounds() {
		const map = this.first_map();
		if (map) {
			return map.getBounds();
		}
	}
	zoom() {
		const map = this.first_map();
		if (map) {
			return map.getZoom();
		}
	}
	center() {
		const map = this.first_map();
		if (map) {
			return map.getCenter();
		}
	}
	horizontal_lng_lat_points() {
		const id = this.first_id();
		if (id) {
			// const x = Math.floor(map._container.clientWidth*0.5*1.01)
			// const y = map._container.clientHeight / 2;
			// return [
			// 	map.unproject([-x, y]),
			// 	map.unproject([+x, y])
			// ]
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const y = element.clientHeight / 2;
				return [map.unproject([0, y]), map.unproject([100, y])];
			}
		}
	}
	// vertical_near_lng_lat_point(){
	// 	const map = this.first_map()
	// 	if(map){
	// 		const x = 0
	// 		const y = map._container.clientHeight
	// 		return map.unproject([+x, y])
	// 	}
	// }
	center_lng_lat_point() {
		const id = this.first_id();
		if (id) {
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const x = element.clientWidth * 0.5;
				const y = element.clientHeight * 0.5;
				return map.unproject([x, y]);
			}
		}
	}
	vertical_far_lng_lat_points() {
		const id = this.first_id();
		if (id) {
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const x = element.clientWidth;
				const y = 0;

				return [map.unproject([0, y]), map.unproject([x, y])];
			}
		}
	}
	vertical_near_lng_lat_points() {
		const id = this.first_id();
		if (id) {
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const x = element.clientWidth;
				const y = element.clientHeight;

				return [map.unproject([0, y]), map.unproject([x, y])];
			}
		}
	}
	// lng_lat_corners(){
	// 	const map = this.first_map()
	// 	if(map){
	// 		const x = map._container.clientWidth
	// 		const y = map._container.clientHeight
	// 		return [
	// 			map.unproject([0, 0]),
	// 			map.unproject([0, y]),
	// 			map.unproject([x, 0]),
	// 			map.unproject([x, y])
	// 		]
	// 	}
	// }

	remove_map(container: HTMLElement) {
		if (container) {
			const map = this._maps_by_container_id.get(container.id);
			if (map) {
				map.remove();

				this._maps_by_container_id.delete(container.id);
				this._map_containers_by_container_id.delete(container.id);
				this._canvases_by_container_id.delete(container.id);
				this._controls_by_container_id.delete(container.id);
			}
		}
	}

	// allows all mapbox viewers depending on the same camera to sync up
	// once one has completed a move
	on_move_end(container: HTMLElement) {
		if (this._moving_maps === true) {
			return;
		}
		this._moving_maps = true; // to avoid infinite loop, as the moved maps will trigger the same event

		if (container != null) {
			const triggering_map = this._maps_by_container_id.get(container.id);
			if (triggering_map != null) {
				const camera_options = this.camera_options_from_map(triggering_map);
				this._maps_by_container_id.forEach((map, container_id) => {
					if (container_id !== container.id) {
						const map = this._maps_by_container_id.get(container_id);
						map?.jumpTo(camera_options);
					}
				});
			}
		}

		this.object.dispatchEvent({type: 'moveend'});

		this._moving_maps = false;
	}
	lng_lat() {
		const val = this.pv.lng_lat;
		return {
			lng: val.x,
			lat: val.y,
		};
	}

	camera_options_from_params() {
		return {
			center: this.lng_lat(),
			pitch: this.pv.pitch,
			bearing: this.pv.bearing,
			zoom: this.pv.zoom,
		};
	}

	camera_options_from_map(map: mapboxgl.Map) {
		// let data;
		// this.pv.lng_lat.toArray();

		return {
			center: map.getCenter(),
			pitch: map.getPitch(),
			bearing: map.getBearing(),
			zoom: map.getZoom(),
		};
	}

	_add_remove_controls(map: mapboxgl.Map, container_id: string) {
		let nav_control = this._controls_by_container_id.get(container_id);
		if (nav_control) {
			if (!this.pv.add_zoom_control) {
				map.removeControl(nav_control);
				this._controls_by_container_id.delete(container_id);
			}
		} else {
			if (this.pv.add_zoom_control) {
				nav_control = new mapboxgl.NavigationControl();
				map.addControl(nav_control, 'bottom-right');
				this._controls_by_container_id.set(container_id, nav_control);
			}
		}
	}

	update_params_from_map() {
		const map = this.first_map();
		if (map) {
			const center = map.getCenter();
			const zoom = map.getZoom();
			const pitch = map.getPitch();
			const bearing = map.getBearing();
			this.p.lng_lat.set([center.lng, center.lat]);
			this.p.zoom.set(zoom);
			this.p.pitch.set(pitch);
			this.p.bearing.set(bearing);
		}
	}
	static PARAM_CALLBACK_update_params_from_map(node: MapboxCameraObjNode) {
		node.update_params_from_map();
	}
	static PARAM_CALLBACK_update_style(node: MapboxCameraObjNode) {
		node.update_style();
	}
	static PARAM_CALLBACK_update_nav(node: MapboxCameraObjNode) {
		node.update_nav();
	}
	update_style() {
		this._maps_by_container_id.forEach((map, container_id) => {
			map.setStyle(this.pv.style);
		});
	}
	update_nav() {
		this._maps_by_container_id.forEach((map) => {
			this.update_map_nav(map);
		});
	}

	create_viewer(element: HTMLElement) {
		return new MapboxViewer(element, this.scene, this);
	}
}
