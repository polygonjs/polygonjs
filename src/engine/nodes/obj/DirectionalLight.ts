import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {DirectionalLightHelper} from 'three/src/helpers/DirectionalLightHelper';

import {TypedLightObjNode} from './_BaseLight';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {HelperController, HelperParamConfig} from './utils/HelperController';

export function DirectionalLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		transform = ParamConfig.FOLDER();
		// directional
		position = ParamConfig.VECTOR3([0, 1, 0]);
		lookat = ParamConfig.OPERATOR_PATH('');

		light = ParamConfig.FOLDER();
		color = ParamConfig.COLOR([1, 1, 1]);
		intensity = ParamConfig.FLOAT(1);
		distance = ParamConfig.FLOAT(100);
		// shadows
		cast_shadows = ParamConfig.BOOLEAN(1);
		shadow_res = ParamConfig.VECTOR2([1024, 1024]);
		shadow_bias = ParamConfig.FLOAT(-0.001);
	};
}

class DirectionalLightObjParamsConfig extends HelperParamConfig(DirectionalLightParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new DirectionalLightObjParamsConfig();

export class DirectionalLightObjNode extends TypedLightObjNode<DirectionalLight, DirectionalLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'directional_light';
	}
	private _helper_controller = new HelperController<DirectionalLightHelper, DirectionalLight>(
		this,
		DirectionalLightHelper
	);
	initialize_node() {
		this._helper_controller.initialize_node();
	}

	create_object() {
		const light = new DirectionalLight();

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		return light;
	}

	// create_light_params() {
	// 	this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
	// 	this.add_param(ParamType.FLOAT, 'intensity', 1);
	// 	this.add_param(ParamType.FLOAT, 'distance', 100);
	// }
	// create_shadow_params() {
	// 	this.add_param(ParamType.BOOLEAN, 'cast_shadows', 1);
	// 	const shadow_options = {visible_if: {cast_shadows: 1}};
	// 	this.add_param(ParamType.VECTOR2, 'shadow_res', [1024, 1024], shadow_options);
	// 	// this.add_param( ParamType.FLOAT, 'shadow_near', 0.1, shadow_options );
	// 	// this.add_param( ParamType.FLOAT, 'shadow_far', 100, shadow_options );
	// 	// this.add_param( 'float', 'shadow_far', 500 ) # same as param distance
	// 	this.add_param(ParamType.FLOAT, 'shadow_bias', -0.0001, shadow_options);
	// 	// this.add_param( 'float', 'shadow_blur', 1, shadow_options );
	// }

	update_light_params() {
		this.object.position.copy(this.pv.position);
		console.log('this.object', this.object.target);
		this.object.color = this.pv.color;
		this.object.intensity = this.pv.intensity;
		this.object.shadow.camera.far = this.pv.distance;

		this._helper_controller.update();
		// this._direction = this.pv.t
		// 	.clone()
		// 	.sub(this.object.target.position)
		// 	.normalize();
	}
	update_shadow_params() {
		this.object.castShadow = this.pv.cast_shadows;
		this.object.shadow.mapSize.copy(this.pv.shadow_res);
		// object.shadow.camera.near = this.pv.shadow_near
		// object.shadow.camera.far = this.pv.shadow_far
		this.object.shadow.bias = this.pv.shadow_bias;

		// updating the camera matrix is not necessary for point light
		// so probably should not for this
		this.object.shadow.camera.updateProjectionMatrix();
	}
	// get direction() {
	// 	return this._direction;
	// }
}
