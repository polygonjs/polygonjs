import {ParamType} from 'src/Engine/Param/_Module'
import {BaseLightTransformed} from './_BaseLightTransformed';
import {PointLight} from 'three/src/lights/PointLight'
const THREE = {PointLight}

export class PointLightObj extends BaseLightTransformed {

	constructor() {
		super();
		this.set_inputs_count_to_one_max();
	}
	static type() { return 'point_light'; }

	create_object() {
		const object = new THREE.PointLight();

		object.castShadow = true;
		object.shadow.bias = -0.001;
		object.shadow.mapSize.x = 1024;
		object.shadow.mapSize.y = 1024;
		object.shadow.camera.near = 0.1;
		return object;
	}

	create_light_params() {
		this.add_param( ParamType.COLOR, 'color', [1,1,1] );
		this.add_param( ParamType.FLOAT, 'intensity', 1 );
		this.add_param( ParamType.FLOAT, 'decay', 0.1 );
		this.add_param( ParamType.FLOAT, 'distance', 100 );
	}
	create_shadow_params() {
		this.add_param( ParamType.TOGGLE, 'cast_shadows', 1);
		const shadow_options = {visible_if: {cast_shadows: 1}}
		this.add_param( ParamType.VECTOR2, 'shadow_res', [1024, 1024], shadow_options );
		this.add_param( ParamType.FLOAT, 'shadow_near', 0.1, shadow_options );
		this.add_param( ParamType.FLOAT, 'shadow_far', 100, shadow_options );
		// this.add_param( 'float', 'shadow_far', 500 ) # same as param distance
		this.add_param( ParamType.FLOAT, 'shadow_bias', -0.0001, shadow_options );
		// this.add_param( 'float', 'shadow_blur', 1, shadow_options );
	}


	update_light_params() {
		let object;
		if ((object = this.object()) != null) {

			object.color = this._param_color;
			object.intensity = this._param_intensity;
			object.decay = this._param_decay;

			return object.distance = this._param_distance;
		}
	}
	update_shadow_params(){
		let object;
		if ((object = this.object()) != null) {
			object.castShadow = this._param_cast_shadows
			object.shadow.mapSize.copy(this._param_shadow_res)
			object.shadow.camera.near = this._param_shadow_near
			object.shadow.camera.far = this._param_shadow_far
			object.shadow.bias = this._param_shadow_bias
		}
	}
}

