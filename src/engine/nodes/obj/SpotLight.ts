import {SpotLight} from 'three/src/lights/SpotLight';
import {SpotLightHelper} from 'three/src/helpers/SpotLightHelper';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {HelperController} from './utils/HelperController';
class SpotLightObjParamsConfig extends TransformedParamConfig(NodeParamsConfig) {
	light = ParamConfig.FOLDER();
	color = ParamConfig.COLOR([1, 1, 1]);
	intensity = ParamConfig.FLOAT(1);
	angle = ParamConfig.FLOAT(45, {range: [0, 180]});
	penumbra = ParamConfig.FLOAT(0.1);
	decay = ParamConfig.FLOAT(0.1, {range: [0, 1]});
	distance = ParamConfig.FLOAT(100, {range: [0, 100]});
	// target = ParamConfig.OPERATOR_PATH('');

	// shadows
	cast_shadows = ParamConfig.BOOLEAN(1);
	shadow_res = ParamConfig.VECTOR2([1024, 1024]);
	shadow_bias = ParamConfig.FLOAT(-0.001);

	// helper
	show_helper = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SpotLightObjParamsConfig();

export class SpotLightObjNode extends BaseLightTransformedObjNode<SpotLight, SpotLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'spot_light';
	}
	private _helper_controller = new HelperController<SpotLightHelper, SpotLight>(this, SpotLightHelper);
	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this._helper_controller.initialize_node();
	}

	create_object() {
		const light = new SpotLight();

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		// const helper = new SpotLightHelper(light, 1);
		// light.add(helper);

		return light;
	}

	// create_light_params() {
	// 	this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
	// 	this.add_param(ParamType.FLOAT, 'intensity', 1);
	// 	this.add_param(ParamType.FLOAT, 'angle', 45, {range: [0, 180]});
	// 	this.add_param(ParamType.FLOAT, 'penumbra', 0.1);
	// 	this.add_param(ParamType.FLOAT, 'decay', 0.1, {range: [0, 100]});
	// 	this.add_param(ParamType.FLOAT, 'distance', 100, {range: [0, 100]});
	// 	this.add_param(ParamType.OPERATOR_PATH, 'target', ''); // to be implemented
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
		this.object.color = this.pv.color;
		this.object.intensity = this.pv.intensity;
		this.object.angle = this.pv.angle * (Math.PI / 180);
		this.object.penumbra = this.pv.penumbra;
		this.object.decay = this.pv.decay;
		this.object.distance = this.pv.distance;

		this._helper_controller.update();
	}
	update_shadow_params() {
		this.object.castShadow = this.pv.cast_shadows;
		this.object.shadow.mapSize.copy(this.pv.shadow_res);
		// object.shadow.camera.near = this.pv.shadow_near
		// object.shadow.camera.far = this.pv.shadow_far
		this.object.shadow.bias = this.pv.shadow_bias;
	}

	// private _update_helper() {
	// 	if (this.scene) {
	// 		// the helper needs to be re-created every frame to be updated when light params change
	// 		if (this._helper) {
	// 			this.scene.display_scene.remove(this._helper);
	// 			this._helper.dispose();
	// 		}
	// 		if (this.pv.show_helper) {
	// 			this._helper = new SpotLightHelper(this.object, 1);
	// 			this.scene.display_scene.add(this._helper);
	// 		}
	// 	}
	// }
}
