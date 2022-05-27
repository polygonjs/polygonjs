/**
 * Adds a brightness/contrast
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {HueSaturationEffect, EffectPass, BlendFunction} from 'postprocessing';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BLEND_FUNCTIONS, BLEND_FUNCTION_MENU_OPTIONS} from '../../../core/post/BlendFunction';
class HueSaturationPostParamsConfig extends NodeParamsConfig {
	/** @param hue */
	hue = ParamConfig.FLOAT(0, {
		range: [0, Math.PI],
		rangeLocked: [false, false],
		step: 0.00001,
		...PostParamOptions,
	});
	/** @param saturation */
	saturation = ParamConfig.FLOAT(0, {
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
	blendFunction = ParamConfig.INTEGER(BLEND_FUNCTIONS.indexOf(BlendFunction.MULTIPLY), {
		...PostParamOptions,
		...BLEND_FUNCTION_MENU_OPTIONS,
	});
}
const ParamsConfig = new HueSaturationPostParamsConfig();
export class HueSaturationPostNode extends TypedPostProcessNode<EffectPass, HueSaturationPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'hueSaturation';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const effect = new HueSaturationEffect();
		const camera = context.camera;
		const pass = new EffectPass(camera, effect);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as HueSaturationEffect;
		effect.hue = this.pv.hue;
		effect.saturation = this.pv.saturation;
		effect.blendMode.opacity.value = this.pv.opacity;
		effect.blendMode.blendFunction = BLEND_FUNCTIONS[this.pv.blendFunction];
	}
}
