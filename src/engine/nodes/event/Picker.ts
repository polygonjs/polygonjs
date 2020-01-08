// import {Vector3} from 'three/src/math/Vector3'
// import {Vector2} from 'three/src/math/Vector2'
// import {Camera} from 'three/src/cameras/Camera'
// const THREE = {Camera, Vector2, Vector3}
// import lodash_max from 'lodash/max'
// import lodash_isString from 'lodash/isString'
// import lodash_isNumber from 'lodash/isNumber'
// import lodash_keys from 'lodash/keys'
// import lodash_each from 'lodash/each'
// import lodash_clone from 'lodash/clone'
// import lodash_sortBy from 'lodash/sortBy'
// import lodash_times from 'lodash/times'
// import lodash_merge from 'lodash/merge'
// import lodash_map from 'lodash/map'

// import {BaseNodeEvent} from './_Base';
// import {GeometryModule} from 'src/Core/Geometry/_Module';
// import {ParamType} from 'src/Engine/Param/_Module'
// import {RayHelper} from 'src/Core/RayHelper'

// import {Callback} from './Picker/Callback'
// import {PlaneIntersect} from './Picker/PlaneIntersect'
// import {GeometryIntersect} from './Picker/GeometryIntersect'

// export class Picker extends
// 	Callback(
// 	PlaneIntersect(
// 	GeometryIntersect(
// 		BaseNodeEvent
// 	))) {
// 	static type() { return 'picker'; }

// 	static EVENT_TYPES = [
// 			'click',
// 			'mousemove',
// 			'render'
// 		];
// 	static METHODS = [
// 		'object_intersect',
// 		'plane_intersect',
// 		// should later add gl
// 	];
// 	static ATTRIB_PARAMS_COUNT = 4;

// 	private _param_active: boolean
// 	private _param_event_type: boolean
// 	private _param_object_mask: string
// 	private _param_dispatch_event: boolean
// 	private _param_line_precision: number
// 	private _param_tscreen: boolean
// 	private _param_cancel_other_pickers_if_intersects: boolean
// 	private _param_tposition: boolean
// 	private _param_tvelocity: boolean

// 	private _param_point_threshold: number
// 	private _old_point_threshold: number

// 	private _event_properties: object
// 	private _next_event_properties_id: number
// 	private _processing: boolean
// 	private _old_line_precision: number

// 	private _cloned_intersect = new THREE.Vector3()
// 	private _intersect_screen_pos = new THREE.Vector2()
// 	private _prev_point_for_velocity: THREE.Vector3

// 	constructor() {
// 		super();

// 		this.set_inputs_count_to_zero();
// 		this._next_event_properties_id = 0;

// 		// to compute objects mask (should be done after eval_all_params also hooked in Event/_Base constructor)
// 		this.add_post_dirty_hook(this.cook.bind(this))
// 	}

// 	create_params() {

// 		// those affect cook
// 		this.within_param_folder('setup', ()=>{
// 			// this._process_params = [
// 			this.add_param( ParamType.TOGGLE, 'active', 1),
// 			this.add_param( ParamType.INTEGER, 'event_type', 1, {
// 				menu: {
// 					type: 'radio',
// 					entries: lodash_map(Picker.EVENT_TYPES, (event_type, i)=> {
// 						return {name: event_type, value: i};
// 				})
// 				}
// 			}),
// 			this.add_param( ParamType.INTEGER, 'method', 0, {
// 				menu: {
// 					type: 'radio',
// 					entries: lodash_map(Picker.METHODS, (method, i)=> {
// 						return {name: method, value: i};
// 				})
// 				}
// 			}),

// 			this.add_param( ParamType.STRING, 'object_mask', '*', {
// 				visible_if: {method: 0}
// 			}),
// 			this.add_param( ParamType.VECTOR, 'plane_axis', [0, 1, 0], {visible_if: {method: 1}}),
// 			this.add_param( ParamType.FLOAT, 'plane_offset', 0, {visible_if: {method: 1}}),
// 				// this.add_param( ParamType.TOGGLE, 'furthest', 1)
// 			// ];

// 			this.add_param( ParamType.TOGGLE, 'dispatch_event', 0);

// 		})

// 		const no_cook_properties = {cook: false};
// 		this.within_param_folder('info', ()=>{
// 			this.add_param( ParamType.TOGGLE, 'tobjects_count', 0);
// 			this.add_param(  ParamType.INTEGER, 'objects_count', 0, lodash_merge({
// 				visible_if: {tobjects_count: 1},
// 			}, no_cook_properties
// 			));

// 			this.add_param( ParamType.TOGGLE, 'tscreen', 0);
// 			this.add_param( ParamType.VECTOR2, 'screen', [0,0], lodash_merge({
// 				visible_if: {tscreen: 1},
// 			}, no_cook_properties));

// 			this.add_param( ParamType.TOGGLE, 'tposition', 0);
// 			this.add_param( ParamType.VECTOR, 'position', [0,0,0], lodash_merge({
// 				visible_if: {tposition: 1},
// 			}, no_cook_properties));

// 			this.add_param( ParamType.TOGGLE, 'tvelocity', 0);
// 			this.add_param( ParamType.VECTOR, 'velocity', [0,0,0], lodash_merge({
// 				visible_if: {tvelocity: 1},
// 			}, no_cook_properties));

// 			this.add_param( ParamType.TOGGLE, 'tindex', 0);
// 			this.add_param(  ParamType.INTEGER, 'index', -1, lodash_merge({
// 				visible_if: {tindex: 1},
// 			}, no_cook_properties));
// 			this.add_param( ParamType.TOGGLE, 'tface_index', 0);
// 			this.add_param(  ParamType.INTEGER, 'face_index', -1, lodash_merge({
// 				visible_if: {tface_index: 1},
// 			}, no_cook_properties));
// 			this.add_param( ParamType.TOGGLE, 'tid', 0);
// 			this.add_param(  ParamType.INTEGER, 'id', -1, lodash_merge({
// 				visible_if: {tid: 1},
// 			}, no_cook_properties));

// 			this.add_param( ParamType.TOGGLE, 'tobject_name', 0);
// 			this.add_param( ParamType.STRING, 'object_name', '', lodash_merge({
// 				visible_if: {tobject_name: 1},
// 			}, no_cook_properties));

// 			//this.add_param( ParamType.STRING, 'attrib_name', '')
// 			//this.add_param( ParamType.STRING, 'attrib_value', '')
// 			lodash_times(Picker.ATTRIB_PARAMS_COUNT, i=> {
// 				this.add_param( ParamType.TOGGLE, `tattrib_value${i}`, 0);
// 				const visible_options = {}
// 				visible_options[`tattrib_value${i}`] = 1
// 				this.add_param( ParamType.STRING, `attrib_name${i}`, '', lodash_merge({
// 					visible_if: visible_options,
// 				}, no_cook_properties));
// 				this.add_param( ParamType.STRING, `attrib_value${i}`, '', lodash_merge({
// 					visible_if: visible_options
// 				}, no_cook_properties));
// 			});

// 		})

// 		this.within_param_folder('callback', ()=>{
// 			this.add_param( ParamType.TOGGLE, 'execute_callback', 0);
// 			this.add_param( ParamType.STRING, 'attrib_callback', '', {
// 				visible_if: {execute_callback: 1},
// 				multiline: true,
// 			});

// 		})

// 		this.within_param_folder('advanced', ()=>{
// 			this.add_param( ParamType.FLOAT, 'line_precision', 0.1),
// 			this.add_param( ParamType.FLOAT, 'point_threshold', 0.1)
// 			this.add_param( ParamType.TOGGLE, 'cancel_other_pickers_if_intersects', 0);
// 		})

// 	}

// 	cook() {
// 		// return this.set_container(null);
// 		this._objects_from_mask = this.self.scene().objects_from_mask(this._param_object_mask)

// 		this.update_plane_intersect_plane()

// 		this.end_cook()
// 	}

// 	active() {
// 		return !this.is_bypassed() && this._param_active;
// 	}
// 	processing() {
// 		return this._processing;
// 	}

// 	async interrupting() {
// 		return await this.param('cancel_other_pickers_if_intersects').eval_p()
// 		// return this._param_cancel_other_pickers_if_intersects;
// 	}

// 	async is_for_event(event_type){
// 		const param_event_type = await this.param('event_type').eval_p()
// 		switch (event_type) {
// 			case 'mouseup': return param_event_type === 0;
// 			case 'mousemove': return param_event_type === 1;
// 			case 'render': return param_event_type === 2;
// 		}
// 	}

// 	async process(element: HTMLElement, event: MouseEvent, camera: THREE.Camera, ray_helper: RayHelper){
// 		if( camera && ray_helper && !this._processing ){
// 			this._processing = true;
// 			this._event_properties = {};
// 			let has_hit_an_object = false

// 			if (this._cooker == null) { this._cooker = this.scene().cooker(); }
// 			this._cooker.block();

// 			this._set_screen_attributes(element, event);

// 			const method = Picker.METHODS[this._param_method]
// 			switch(method){
// 				case 'object_intersect': {
// 					has_hit_an_object = this.process_geometry_intersect(element, event, camera, ray_helper)
// 					break
// 				}
// 				case 'plane_intersect': {
// 					has_hit_an_object = this.process_plane_intersect(element, event, camera, ray_helper)
// 					break
// 				}
// 			}

// 			if(has_hit_an_object){
// 				await this._execute_callback_if_required()
// 			}

// 			this._cooker.unblock();

// 			this._processing = false;
// 			return has_hit_an_object
// 		} else {
// 			return false
// 		}
// 	}
// 				//@_processing = false

// 	_prepare_ray_helper(ray_helper){
// 		// set ray_helper line precision
// 		this._old_line_precision = ray_helper.line_precision();
// 		const new_line_precision = this._param_line_precision * ray_helper.line_precision_mult();
// 		ray_helper.set_line_precision( new_line_precision );

// 		// set ray_helper points threshold
// 		this._old_point_threshold = ray_helper.point_threshold();
// 		const new_point_threshold = this._param_point_threshold * ray_helper.point_threshold_mult();
// 		return ray_helper.set_point_threshold( new_point_threshold );
// 	}

// 	_restore_ray_helper(ray_helper){
// 		ray_helper.set_line_precision(this._old_line_precision);
// 		return ray_helper.set_line_precision(this._old_point_threshold);
// 	}

// 	_sort_by_screen_distance(intersects, camera, mouse_screen_pos){
// 		if (intersects.length === 0) {
// 			return null;
// 		} else {
// 			return lodash_sortBy(intersects, intersect=> {
// 				// let dist;
// 				this._cloned_intersect.copy(intersect)
// 				this._cloned_intersect.project(camera)
// 				this._intersect_screen_pos.x = this._cloned_intersect.x
// 				this._intersect_screen_pos.y = this._cloned_intersect.y
// 				// this._intersect_screen_pos.copy(this._cloned_intersect)
// 				// const intersect_screen_pos = intersect.point.clone().project(camera).toArray();
// 				// const intersect_screen_pos_v = new THREE.Vector2(intersect_screen_pos[0], intersect_screen_pos[1]);
// 				return this._intersect_screen_pos.distanceTo(mouse_screen_pos);
// 			})[0];

// 			// return intersects[0];
// 		}
// 	}

// 	_set_param_if_allowed(name, value){
// 		const tcache_name = this.param_cache_name(`t${name}`);
// 		if (this[tcache_name] !== true) { return; }

// 		return this.param(name).set(value);
// 	}

// 	_set_screen_attributes(element, event){
// 		if (this._param_tscreen !== true) { return; }

// 		const dim = element.getBoundingClientRect();
// 		const x = (event.pageX - dim.x) / dim.width;
// 		const y = 1-((event.pageY - dim.y) / dim.height);
// 		this._event_properties['screen'] = [x,y];
// 		return this._set_param_if_allowed('screen', [x,y]);
// 	}

// 	_dispatch_event(){
// 		if (this._param_dispatch_event) {
// 			return this.scene().dispatch_event(this, this._event_properties);
// 		}
// 	}

// 	// _set_position: (geometry, index)->
// 	// 	position_array = geometry.getAttribute('position').array
// 	// 	position = [
// 	// 		position_array[index*3+0]
// 	// 		position_array[index*3+1]
// 	// 		position_array[index*3+2]
// 	// 	]
// 	// 	@_event_properties['P'] = position
// 	// 	this.param('position').set(position)

// 	set_position_from_intersect_point(intersect_point){
// 		if (this._param_tposition !== true) { return; }
// 		const pos = intersect_point.toArray();
// 		this._event_properties['P'] = pos;
// 		this._set_param_if_allowed('position', pos);
// 	}
// 	set_velocity_from_intersect_point(intersect_point){
// 		if (this._param_tvelocity !== true) { return; }

// 		if(this._prev_point_for_velocity){
// 			this._cloned_intersect.copy(intersect_point)
// 			const vel = this._cloned_intersect.
// 				sub(this._prev_point_for_velocity).
// 				multiplyScalar(this.scene().fps())

// 			this._event_properties['velocity'] = vel;
// 			this._set_param_if_allowed('velocity', vel);
// 		}

// 		this._prev_point_for_velocity = intersect_point
// 	}

// }
