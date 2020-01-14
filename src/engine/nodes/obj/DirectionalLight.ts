// import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
// import {DirectionalLight} from 'three/src/lights/DirectionalLight';
// import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
// import {Color} from 'three/src/math/Color';
// import {Vector2} from 'three/src/math/Vector2';
// import {ParamType} from 'src/engine/poly/ParamType';

// export class DirectionalLightObj extends BaseLightTransformedObjNode {
// 	@ParamC('color') _param_color: Color;
// 	@ParamF('intensity') _param_intensity: number;
// 	@ParamF('distance') _param_distance: number;
// 	@ParamB('cast_shadows') _param_cast_shadows: boolean;
// 	@ParamV2('shadow_res') _param_shadow_res: Vector2;
// 	@ParamF('shadow_bias') _param_shadow_bias: number;
// 	static type() {
// 		return 'directional_light';
// 	}

// 	create_object() {
// 		const object = new DirectionalLight();

// 		object.castShadow = true;
// 		object.shadow.bias = -0.001;
// 		object.shadow.mapSize.x = 1024;
// 		object.shadow.mapSize.y = 1024;
// 		object.shadow.camera.near = 0.1;
// 		return object;
// 	}

// 	create_light_params() {
// 		this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
// 		this.add_param(ParamType.FLOAT, 'intensity', 1);
// 		this.add_param(ParamType.FLOAT, 'distance', 100);
// 	}
// 	create_shadow_params() {
// 		this.add_param(ParamType.BOOLEAN, 'cast_shadows', 1);
// 		const shadow_options = {visible_if: {cast_shadows: 1}};
// 		this.add_param(ParamType.VECTOR2, 'shadow_res', [1024, 1024], shadow_options);
// 		// this.add_param( ParamType.FLOAT, 'shadow_near', 0.1, shadow_options );
// 		// this.add_param( ParamType.FLOAT, 'shadow_far', 100, shadow_options );
// 		// this.add_param( 'float', 'shadow_far', 500 ) # same as param distance
// 		this.add_param(ParamType.FLOAT, 'shadow_bias', -0.0001, shadow_options);
// 		// this.add_param( 'float', 'shadow_blur', 1, shadow_options );
// 	}

// 	update_light_params() {
// 		this.object.color = this._param_color;
// 		this.object.intensity = this._param_intensity;
// 		(this.object.shadow.camera as OrthographicCamera).far = this._param_distance;

// 		// this._direction = this._param_t
// 		// 	.clone()
// 		// 	.sub(this.object.target.position)
// 		// 	.normalize();
// 	}
// 	update_shadow_params() {
// 		this.object.castShadow = this._param_cast_shadows;
// 		this.object.shadow.mapSize.copy(this._param_shadow_res);
// 		// object.shadow.camera.near = this._param_shadow_near
// 		// object.shadow.camera.far = this._param_shadow_far
// 		this.object.shadow.bias = this._param_shadow_bias;

// 		// updating the camera matrix is not necessary for point light
// 		// so probably should not for this
// 		(this.object.shadow.camera as OrthographicCamera).updateProjectionMatrix();
// 	}
// 	// get direction() {
// 	// 	return this._direction;
// 	// }
// }
