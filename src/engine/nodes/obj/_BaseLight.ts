import {BaseObjNode} from './_Base';

// class BaseModules extends Base {
// 	constructor() {
// 		super();
// 	}
// }
// window.include_instance_methods(BaseModules, Dirtyable.instance_methods);

export class BaseLight extends BaseNodeObj {
	constructor() {
		super();
		this._init_dirtyable_hook();
	}

	create_params() {
		this.create_light_params();
		return this.create_shadow_params_main();
	}

	create_shadow_params_main() {
		if (this.object().shadow != null) {
			return this.create_shadow_params();
		}
	}

	create_shadow_params() {
		return;
		// this.add_param('toggle', 'cast_shadows', 1);
		// shadow_options = {visible_if: {cast_shadows: 1}}
		// this.add_param( 'vector2', 'shadow_res', [1024, 1024], shadow_options );
		// this.add_param( 'float', 'shadow_near', 0.1, shadow_options );
		// this.add_param( 'float', 'shadow_far', 100, shadow_options );
		// // this.add_param( 'float', 'shadow_far', 500 ) # same as param distance
		// this.add_param( 'float', 'shadow_bias', -0.0001, shadow_options );
		// this.add_param( 'float', 'shadow_blur', 1, shadow_options );
	}

	// as_code_set_up_custom: ->
	// 	lines = []
	// 	lines.push "#{this.code_var_name()}.set_display_flag(#{this.display_flag_state()})"
	// 	lines

	cook() {
		this.update_light_params();
		this.update_shadow_params();
		this.end_cook();
	}

	update_shadow_params() {
		let object;
		return;
		// if (((object = this.object()) != null) && (object.shadow != null)) {

		// 	object.castShadow = this._param_cast_shadow;

		// 	object.shadow.mapSize.width = this._param_shadow_res.x;
		// 	object.shadow.mapSize.height = this._param_shadow_res.y;
		// 	object.shadow.camera.near = this._param_shadow_near;
		// 	object.shadow.camera.far = this._param_shadow_far;
		// 	return object.shadow.bias = this._param_shadow_bias;
		// }
	}

	color() {
		return this._param_color.clone().multiplyScalar(this._param_intensity);
	}
	active() {
		return this.display_flag_state();
	}
}
