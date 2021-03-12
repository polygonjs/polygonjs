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
import {RectAreaLightHelper} from '../../../modules/three/examples/jsm/helpers/RectAreaLightHelper';
import {BaseLightTransformedObjNode} from './_BaseLightTransformed';
import {TransformedParamConfig} from './utils/TransformController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorConversion} from '../../../core/Color';
import {HelperController} from './utils/HelperController';
import {RectAreaLightObjNodeHelper} from './utils/helpers/AreaLightHelper';

export function AreaLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		light = ParamConfig.FOLDER();
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
		// helper
		/** @param toggle on to show helper */
		showHelper = ParamConfig.BOOLEAN(0);
	};
}

class AreaLightObjParamsConfig extends AreaLightParamConfig(TransformedParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new AreaLightObjParamsConfig();

export class AreaLightObjNode extends BaseLightTransformedObjNode<RectAreaLight, AreaLightObjParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'areaLight';
	}
	private _helper_controller = new HelperController<RectAreaLightHelper, RectAreaLight>(
		this,
		RectAreaLightObjNodeHelper as any,
		'RectAreaLightObjNodeHelper'
	);
	initializeNode() {
		this._helper_controller.initializeNode();
	}

	createLight() {
		const light = new RectAreaLight(0xffffff, 1, 1, 1);
		light.matrixAutoUpdate = false;

		if (!(RectAreaLightUniformsLib as any).initialized) {
			RectAreaLightUniformsLib.init();
			(RectAreaLightUniformsLib as any).initialized = true;
		}

		return light;
	}

	protected updateLightParams() {
		this.light.color = this.pv.color;
		this.light.intensity = this.pv.intensity;
		this.light.width = this.pv.width;
		this.light.height = this.pv.height;

		this._helper_controller.update();
	}
}
