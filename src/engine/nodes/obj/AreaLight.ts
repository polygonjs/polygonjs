/**
 * Creates an area light.
 *
 * @remarks
 * An area light can be expensive to compute but can give a good result.
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {RectAreaLight} from 'three/src/lights/RectAreaLight';
import {RectAreaLightUniformsLib} from '../../../modules/three/examples/jsm/lights/RectAreaLightUniformsLib';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorConversion} from '../../../core/Color';

export function AreaLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param light color */
		color = ParamConfig.COLOR([1, 1, 1], {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(1, {range: [0, 10]});
		/** @param grid width */
		width = ParamConfig.FLOAT(1, {range: [0, 10]});
		/** @param grid height */
		height = ParamConfig.FLOAT(1, {range: [0, 10]});
	};
}

class AreaLightObjParamsConfig extends AreaLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new AreaLightObjParamsConfig();

export class AreaLightObjNode extends BaseLightTransformedObjNode<RectAreaLight, AreaLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'areaLight';
	}
	// private _helper_controller = new HelperController<RectAreaLightHelper, RectAreaLight>(this, RectAreaLightHelper);
	// initialize_node() {
	// 	this._helper_controller.initialize_node();
	// }

	create_light() {
		const light = new RectAreaLight(0xffffff, 1, 1, 1);
		light.matrixAutoUpdate = false;
		return light;
	}

	// create_light_params() {
	// 	this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
	// 	this.add_param(ParamType.FLOAT, 'intensity', 1, {range: [0, 10]});
	// 	this.add_param(ParamType.FLOAT, 'width', 1, {range: [0, 10]});
	// 	this.add_param(ParamType.FLOAT, 'height', 1, {range: [0, 10]});
	// }

	update_light_params() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.width = this.pv.width;
		this.light.height = this.pv.height;
		// this._helper_controller.update();
	}

	async cook() {
		// const {RectAreaLightUniformsLib} = await CoreScriptLoader.load_module_three_light('RectAreaLightUniformsLib');
		// const module = RectAreaLightUniformsLib
		if (!(RectAreaLightUniformsLib as any).initialized) {
			RectAreaLightUniformsLib.init();
			(RectAreaLightUniformsLib as any).initialized = true;
		}

		this.transform_controller.update();
		this.update_light_params();
		this.update_shadow_params();
		this.cookController.end_cook();
	}
}
