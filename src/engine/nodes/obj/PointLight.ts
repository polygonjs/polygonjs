/**
 * Creates a point light.
 *
 *
 */
import {PointLight} from 'three/src/lights/PointLight';
import {PointLightHelper} from './utils/helpers/PointLightHelper';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HelperController, HelperConstructor} from './utils/HelperController';
import {ColorConversion} from '../../../core/Color';
class PointLightObjParamsConfig extends TransformedParamConfig(NodeParamsConfig) {
	light = ParamConfig.FOLDER();
	/** @param light color */
	color = ParamConfig.COLOR([1, 1, 1], {
		conversion: ColorConversion.SRGB_TO_LINEAR,
	});
	/** @param light intensity */
	intensity = ParamConfig.FLOAT(1);
	/** @param light decay */
	decay = ParamConfig.FLOAT(0.1);
	/** @param light distance */
	distance = ParamConfig.FLOAT(100);
	// shadows
	/** @param toggle to cast shadows */
	cast_shadows = ParamConfig.BOOLEAN(1);
	/** @param shadow res */
	shadow_res = ParamConfig.VECTOR2([1024, 1024], {visible_if: {cast_shadows: 1}});
	/** @param shadow bias */
	shadow_bias = ParamConfig.FLOAT(0.001, {visible_if: {cast_shadows: 1}});
	/** @param shadow camera near */
	shadow_near = ParamConfig.FLOAT(1, {visible_if: {cast_shadows: 1}});
	/** @param shadow camera far */
	shadow_far = ParamConfig.FLOAT(100, {visible_if: {cast_shadows: 1}});

	// helper
	/** @param toggle to show helper */
	show_helper = ParamConfig.BOOLEAN(0);
	/** @param helper size */
	helper_size = ParamConfig.FLOAT(1, {visible_if: {show_helper: 1}});
}
const ParamsConfig = new PointLightObjParamsConfig();

export class PointLightObjNode extends BaseLightTransformedObjNode<PointLight, PointLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'point_light';
	}
	private _helper_controller = new HelperController<PointLight>(
		this,
		(<unknown>PointLightHelper) as HelperConstructor<PointLight>,
		'PointLightHelper'
	);
	initialize_node() {
		this._helper_controller.initialize_node();
	}

	create_light() {
		const light = new PointLight();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		return light;
	}

	update_light_params() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.decay = this.pv.decay;

		this.light.distance = this.pv.distance;

		this._helper_controller.update();
	}
	update_shadow_params() {
		this.light.castShadow = this.pv.cast_shadows;
		this.light.shadow.mapSize.copy(this.pv.shadow_res);
		this.light.shadow.camera.near = this.pv.shadow_near;
		this.light.shadow.camera.far = this.pv.shadow_far;
		this.light.shadow.bias = this.pv.shadow_bias;
	}
}
