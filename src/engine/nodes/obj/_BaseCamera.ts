import lodash_isNaN from 'lodash/isNaN'

import {BaseNodeObj} from './_Base';
import {NodeContext} from 'src/Engine/Poly'

import {CoreTransform} from 'src/Core/Transform';

import {Dirtyable} from './Concerns/Dirtyable';
import {Layers} from './Concerns/Layers';
import {PostProcess} from './Concerns/PostProcess';
import {Transformed} from './Concerns/Transformed';
import {Background} from './Concerns/Background';
import {ParamType} from 'src/Engine/Param/_Module'
// import {CoreTextureLoader} from 'src/Core/Loader/Texture'
import {CameraControls} from './Concerns/CameraControls'
// import {File} from 'src/Engine/Node/Cop/File'
import {ThreejsViewer} from 'src/Engine/Viewer/Threejs'
// class BaseModules extends Base {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Dirtyable.instance_methods);
// window.include_instance_methods(BaseModules, Layers.instance_methods);
// window.include_instance_methods(BaseModules, Transformed.instance_methods);

// import {CoreTransform} from 'src/Core/Transform'

const EVENT_CHANGE = { type: 'change' };

export const BASE_CAMERA_DEFAULT = {
	near: 1.0,
	far: 100.0
};

export class BaseCamera extends
	CameraControls(
	Dirtyable(
	PostProcess(
	Layers(
	Background(
	Transformed(
	BaseNodeObj
	))))))
	{

	_param_near: number
	_param_far: number
	_aspect: number
	_param_lock_width: boolean

	constructor() {
		super();

		this.set_inputs_count_to_one_max();
		this._init_dirtyable_hook()
	}

	create_common_params() {

		this.within_param_folder('transform', ()=>{
			this.add_param( ParamType.OPERATOR_PATH, 'controls', '', {
				node_selection: {
					context: NodeContext.EVENT
				}
			});
			CoreTransform.create_params(this);
			// this.add_param( ParamType.TOGGLE, 'is_updating', 0, {cook: false, hidden: true}); //, hidden: true} )
			this.add_param( ParamType.VECTOR, 'target', [0,0,0], {cook: false}); //, hidden: true} )
		})

		this.within_param_folder('render', ()=>{
			this.create_layers_params();

			this.add_param( ParamType.FLOAT, 'near', BASE_CAMERA_DEFAULT.near,
				{range: [0, 100]});
			this.add_param( ParamType.FLOAT, 'far', BASE_CAMERA_DEFAULT.far,
				{range: [0, 100]});
			this.add_param(ParamType.TOGGLE, 'lock_width', 1);
		})

		this.add_background_params()
		this.create_post_process_params();
	}

	create_player_camera_params() {
		this.add_param(ParamType.BUTTON, 'set_master_camera', '',
			{callback: this.set_as_master_camera.bind(this)});
	}
	// is_updating():boolean{
	// 	return this.param('is_updating').value()
	// }

	// as_code_set_up_custom: ->
	// 	lines = []
	// 	lines.push "#{this.code_var_name()}.set_display_flag(#{this.display_flag_state()})"
	// 	lines

	async cook() {
		this.update_transform();
		this.update_layers();
		await this.update_background();

		if(
			this._object.near != this._param_near ||
			this._object.far != this._param_far
		){
			this._object.near = this._param_near
			this._object.far = this._param_far
			this._object.updateProjectionMatrix()
		}

		await this.update_composer_passes()
		this.update_camera();
		this.update_controls();

		// TODO: ideally the update transform and update camera
		// can both return if the camera has changed
		// and we can run this here instead of inside the update_transform and update_camera
		// this._object.dispatchEvent( EVENT_CHANGE )
		this._object.dispatchEvent( EVENT_CHANGE )
		this.end_cook();
	}

	on_create() {}
		//
	on_delete() {}
		//

	camera() {
		return this._object;
	}

	update_camera() {}
	
		//

	set_as_master_camera() {
		this.scene().set_master_camera_node_path(this.full_path());
	}

	setup_for_aspect_ratio(aspect: number){
		if (lodash_isNaN(aspect)) { return; }
		if(aspect && (this._aspect != aspect)){
			this._aspect = aspect
			this._update_for_aspect_ratio()
		}
	}
	abstract _update_for_aspect_ratio(){
	}


	update_transform_params_from_object(){
		// CoreTransform.set_params_from_matrix(this._object.matrix, this, {scale: false})
		CoreTransform.set_params_from_object(this._object, this)
	}
	viewer(element: HTMLElement){
		return new ThreejsViewer(element, this.scene(), this)
	}
}
					// 	console.warn "camera #{this.full_path()} has no controls assigned"




	// controls_node: ->
	// 	if @_param_controls? && @_param_controls != ''
	// 		Core.Walker.find_node(this, @_param_controls)

