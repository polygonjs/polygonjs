/**
 * Creates a spot light.
 *
 *
 */
import {SpotLight} from 'three/src/lights/SpotLight';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {SpotLightHelper} from './utils/helpers/SpotLightHelper';
import {Object3D} from 'three/src/core/Object3D';
import {ColorConversion} from '../../../core/Color';
class SpotLightObjParamsConfig extends TransformedParamConfig(NodeParamsConfig) {
	light = ParamConfig.FOLDER();
	/** @param light color */
	color = ParamConfig.COLOR([1, 1, 1], {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param light intensity */
	intensity = ParamConfig.FLOAT(1);
	/** @param angle */
	angle = ParamConfig.FLOAT(45, {range: [0, 180]});
	/** @param penumbra */
	penumbra = ParamConfig.FLOAT(0.1);
	/** @param decay */
	decay = ParamConfig.FLOAT(0.1, {range: [0, 1]});
	/** @param distance */
	distance = ParamConfig.FLOAT(100, {range: [0, 100]});
	// target = ParamConfig.OPERATOR_PATH('');

	// shadows
	/** @param toggle on to cast shadows */
	cast_shadows = ParamConfig.BOOLEAN(1);
	/** @param shadows res */
	shadow_res = ParamConfig.VECTOR2([1024, 1024], {
		visible_if: {cast_shadows: 1},
	});
	/** @param shadows bias */
	shadow_bias = ParamConfig.FLOAT(0.001, {
		visible_if: {cast_shadows: 1},
		range: [-0.01, 0.01],
		range_locked: [false, false],
	});
	// shadow_near = ParamConfig.FLOAT(0.1, {
	// 	visible_if: {cast_shadows: 1},
	// 	range: [0, 100],
	// 	range_locked: [true, false],
	// });
	// shadow_far = ParamConfig.FLOAT(100, {
	// 	visible_if: {cast_shadows: 1},
	// 	range: [0, 100],
	// 	range_locked: [true, false],
	// });

	// helper
	/** @param toggle on to show helper */
	show_helper = ParamConfig.BOOLEAN(0);
	/** @param helper size */
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
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		this._target_target = light.target;
		this._target_target.name = 'SpotLight Default Target';
		this._target_target.matrixAutoUpdate = false;
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
		// that doesn't seem to have any effect
		// this.light.shadow.camera.near = this.pv.shadow_near;
		// this.light.shadow.camera.far = this.pv.shadow_far;
		this.light.shadow.bias = this.pv.shadow_bias;
	}
}
