import lodash_values from 'lodash/values'

import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera'
import {Camera} from 'three/src/cameras/Camera'
const THREE = {Camera, PerspectiveCamera}
import {BaseCamera} from './_BaseCamera';

// import * as mapboxgl from 'mapbox-gl'

import {ParamType} from 'src/Engine/Param/_Module'

import {MapboxViewer} from 'src/Engine/Viewer/Mapbox'
import {CoreMapboxClient} from 'src/Core/Mapbox/Client'

export class MapboxCamera extends BaseCamera {
	static type() { return 'mapbox_camera'; }

	

	private _maps_by_container_id: object
	private _controls_by_container_id: object
	private _components_by_container_id: object

	constructor() {
		super();
		this._maps_by_container_id = {};
		this._controls_by_container_id = {};
		this._components_by_container_id = {};
	}
			
	create_object() {
		//new THREE.Camera()
		// return new THREE.Camera();
		return new THREE.PerspectiveCamera(); // I use a PerspectiveCamera to have the picker working
	}
		//camera = new THREE.PerspectiveCamera()
		//camera.near = 0.19
		//camera.far = 0.2
		//camera.updateProjectionMatrix()
		//window.test_camera = camera

	create_params() {
		//this.create_common_params()
		this.add_param(ParamType.STRING, 'style', 'mapbox://styles/mapbox/dark-v10');

		//options =
		//	cook: false # so that the node does not recook when I set the gps coordinates
		this.add_param(ParamType.VECTOR2, 'lng_lat', [-0.07956, 51.5146]);
		this.add_param(ParamType.FLOAT, 'zoom', 15.55, {
			range: [0, 24],
			range_locked: [true, true]
		});
		this.add_param(ParamType.VECTOR2, 'zoom_range', [0, 24], { // TODO: make integer size 2
			range: [0, 24],
			range_locked: [true, true]
		});
		this.add_param(ParamType.FLOAT, 'pitch', 60, {
			range: [0, 60],
			range_locked: [true, true]
		});
		this.add_param(ParamType.FLOAT, 'bearing', 60.3736130,
			{range: [0, 360]});

		this.add_param(ParamType.BUTTON, 'set_as_default', '', {callback: this._set_as_default.bind(this)})
		this.add_param(ParamType.TOGGLE, 'allow_drag_rotate', 1);
		this.add_param(ParamType.TOGGLE, 'add_zoom_control', 1);

		//this.add_param('vector2', 'lng_lat_at_start', [-0.10, 51.52], options)
		//this.add_param('vector2', 'lng_lat_mouse_move', [-0.10, 51.52], options)
		//this.add_param('vector2', 'lng_lat_mouse_up', [-0.10, 51.52], options)
		this.create_player_camera_params();
		
	}




	cook() {
		this.update_maps();
		this.end_cook();
	}


	// prepare_for_viewer: (aspect)->
	// 	#if (camera = this.object())?
	// 	#	#

	async create_map(component, container){
		await this.eval_all_params()
		await CoreMapboxClient.ensure_token_is_set(this.scene());

		//this.param('lng_lat_at_start').set(@_start_lng_lat)
		const map = new mapboxgl.Map({
			style: this._param_style,
			container,
			center: this._param_lng_lat.toArray(),
			zoom: this._param_zoom,
			minZoom: this._param_zoom_range.x,
			maxZoom: this._param_zoom_range.y,
			pitch: this._param_pitch,
			//bearing = this._param_bearing
			preserveDrawingBuffer: true,
			dragRotate: this._param_allow_drag_rotate,
			pitchWithRotate: this._param_allow_drag_rotate
		});

		this._add_remove_controls(map, container.id);

		this._maps_by_container_id[container.id] = map;
		this._components_by_container_id[container.id] = component;

		return map
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
		Object.keys(this._maps_by_container_id).forEach((container_id)=> {
			this.update_map(container_id);
		});
	}

		//this.object().dispatchEvent('change')

	update_map(container_id){
		const map = this._maps_by_container_id[container_id];

		// position/zoom/pitch/bearing
		console.log(this.camera_options_from_params())
		map.jumpTo( this.camera_options_from_params() );
		map.setMinZoom( this._param_zoom_range.x );
		map.setMaxZoom( this._param_zoom_range.y );

		const drag_rotate_handler = map.dragRotate;
		if (this._param_allow_drag_rotate) {
			drag_rotate_handler.enable();
		} else {
			drag_rotate_handler.disable();
		}

		// controls
		this._add_remove_controls(map, container_id);

		// style
		return map.setStyle( this._param_style );
	}


	first_map() {
		const keys = Object.keys(this._maps_by_container_id)
		return this._maps_by_container_id[keys[0]] // lodash_values(this._maps_by_container_id)[0];
	}
	bounds() {
		const map = this.first_map()
		if(map){
			return map.getBounds()
		}
	}
	zoom() {
		const map = this.first_map()
		if(map){
			return map.getZoom()
		}
	}
	center() {
		const map = this.first_map()
		if(map){
			return map.getCenter()
		}
	}
	horizontal_lng_lat_points(){
		const map = this.first_map()
		if(map){
			// const x = Math.floor(map._container.clientWidth*0.5*1.01)
			// const y = map._container.clientHeight / 2;
			// return [
			// 	map.unproject([-x, y]),
			// 	map.unproject([+x, y])
			// ]
			const y = map._container.clientHeight / 2;
			return [
				map.unproject([0, y]),
				map.unproject([100, y])
			]
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
	center_lng_lat_point(){
		const map = this.first_map()
		if(map){
			const x = map._container.clientWidth * 0.5
			const y = map._container.clientHeight * 0.5
			return map.unproject([x, y])
		}
	}
	vertical_far_lng_lat_points(){
		const map = this.first_map()
		if(map){
			const x = map._container.clientWidth
			const y = 0
			return [
				map.unproject([0, y]),
				map.unproject([x, y])
			]
		}
	}
	vertical_near_lng_lat_points(){
		const map = this.first_map()
		if(map){
			const x = map._container.clientWidth
			const y = map._container.clientHeight
			return [
				map.unproject([0, y]),
				map.unproject([x, y])
			]
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



	remove_map(container){
		if (container != null) {
			const map = this._maps_by_container_id[container.id];
			if (map != null) {
				map.remove();

				delete this._maps_by_container_id[container.id];
				delete this._controls_by_container_id[container.id];
				return delete this._components_by_container_id[container.id];
			}
		}
	}

	// allows all mapbox viewers depending on the same camera to sync up
	// once one has completed a move
	on_move_end(container: HTMLElement){
		if (this._moving_maps === true) { return; }
		this._moving_maps = true; // to avoid infinite loop, as the moved maps will trigger the same event

		if (container != null) {
			const triggering_map = this._maps_by_container_id[container.id];
			if (triggering_map != null) {
				const camera_options = this.camera_options_from_map( triggering_map );
				for(let container_id of Object.keys(this._maps_by_container_id)){
					if (container_id !== container.id) {
						const map = this._maps_by_container_id[container_id];
						map.jumpTo( camera_options );
					}
				}
			}
		}

		this.object().dispatchEvent({type: 'moveend'});

		this._moving_maps = false;
	}
	lng_lat(){
		const val = this.param('lng_lat').value()
		return {
			lng: val[0],
			lat: val[1]
		}
	}

	camera_options_from_params() {
		let data;
		// this._param_lng_lat.toArray();

		return data = {
			center: this.lng_lat(),
			pitch: this._param_pitch,
			bearing: this._param_bearing,
			zoom: this._param_zoom
		};
	}

	camera_options_from_map(map){
		let data;
		this._param_lng_lat.toArray();

		return data = {
			center: map.getCenter(),
			pitch: map.getPitch(),
			bearing: map.getBearing(),
			zoom: map.getZoom()
		};
	}


	_add_remove_controls(map, container_id){
		let nav_control;
		if ((nav_control = this._controls_by_container_id[container_id]) != null) {
			if (!this._param_add_zoom_control) {
				map.removeControl(nav_control, 'bottom-right');
				return delete this._controls_by_container_id[container_id];
			}
		} else {
			if (this._param_add_zoom_control) {
				nav_control = new mapboxgl.NavigationControl();
				map.addControl(nav_control, 'bottom-right');
				return this._controls_by_container_id[container_id] = nav_control;
			}
		}
	}

	_set_as_default(){
		const map = this.first_map()
		if(map){
			const center = map.getCenter()
			const zoom = map.getZoom()
			const pitch = map.getPitch()
			const bearing = map.getBearing()
			this.param('lng_lat').set([center.lng, center.lat])
			this.param('zoom').set(zoom)
			this.param('pitch').set(pitch)
			this.param('bearing').set(bearing)

		}
	}
	viewer(element: HTMLElement){
		return new MapboxViewer(element, this.scene(), this)
	}
}
