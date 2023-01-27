/**
 * Adds a brightness/contrast
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {BlendFunction, BrightnessContrastEffect, EffectPass} from 'postprocessing';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BLEND_FUNCTION_MENU_OPTIONS} from '../../../core/post/BlendFunction';
class BrightnessContrastPostParamsConfig extends NodeParamsConfig {
	/** @param brightness */
	brightness = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param contrast */
	contrast = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param effect opacity */
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param render mode */
	blendFunction = ParamConfig.INTEGER(BlendFunction.NORMAL, {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
}
const ParamsConfig = new BrightnessContrastPostParamsConfig();
export class BrightnessContrastPostNode extends TypedPostNode<EffectPass, BrightnessContrastPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'brightnessContrast';
	}

	override createPass(context: TypedPostNodeContext) {
		const effect = new BrightnessContrastEffect();
		const camera = context.camera;
		const pass = new EffectPass(camera, effect);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as BrightnessContrastEffect;
		effect.brightness = this.pv.brightness;
		effect.contrast = this.pv.contrast;
		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = this.pv.blendFunction;
	}
}
