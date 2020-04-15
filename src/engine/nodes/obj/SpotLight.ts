import {SpotLight} from 'three/src/lights/SpotLight';
// import {SpotLightHelper} from 'three/src/helpers/SpotLightHelper';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {SpotLightHelper} from './utils/helpers/SpotLightHelper';
import {Object3D} from 'three/src/core/Object3D';
// import {HelperController} from './utils/HelperController';
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
	shadow_res = ParamConfig.VECTOR2([1024, 1024], {
		visible_if: {cast_shadows: 1},
	});
	shadow_bias = ParamConfig.FLOAT(0.001, {
		visible_if: {cast_shadows: 1},
		range: [-0.01, 0.01],
		range_locked: [false, false],
	});

	// helper
	show_helper = ParamConfig.BOOLEAN(1);
	helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
}
const ParamsConfig = new SpotLightObjParamsConfig();

export class SpotLightObjNode extends BaseLightTransformedObjNode<SpotLight, SpotLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'spot_light';
	}
	private _target_target!: Object3D;
	private _helper_controller = new HelperController<SpotLight>(
		this,
		(<unknown>SpotLightHelper) as HelperConstructor<SpotLight>,
		'SpotLightHelper'
	);
	initialize_node() {
		// this.io.inputs.set_count(0, 1);
		this._helper_controller.initialize_node();
	}

	create_light() {
		const light = new SpotLight();

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		this._target_target = light.target;
		this._target_target.name = 'SpotLight Default Target';
		this.object.add(this._target_target);

		return light;
	}
	// add_object_to_parent(parent: Object3D) {
	// 	super.add_object_to_parent(parent);
	// 	parent.add(this._target_target);
	// }
	// remove_object_from_parent() {
	// 	super.remove_object_from_parent();
	// 	const parent = this._target_target.parent;
	// 	if (parent) {
	// 		parent.remove(this._target_target);
	// 	}
	// }

	update_light_params() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.angle = this.pv.angle * (Math.PI / 180);
		this.light.penumbra = this.pv.penumbra;
		this.light.decay = this.pv.decay;
		this.light.distance = this.pv.distance;

		this._helper_controller.update();
	}
	update_shadow_params() {
		this.light.castShadow = this.pv.cast_shadows;
		this.light.shadow.mapSize.copy(this.pv.shadow_res);
		// object.shadow.camera.near = this.pv.shadow_near
		// object.shadow.camera.far = this.pv.shadow_far
		this.light.shadow.bias = this.pv.shadow_bias;
	}
}
