/**
 * applies a sepia look
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EffectPass, SepiaEffect} from 'postprocessing';
class SepiaPostParamsConfig extends NodeParamsConfig {
	/** @param amount */
	amount = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new SepiaPostParamsConfig();
export class SepiaPostNode extends TypedPostNode<EffectPass, SepiaPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sepia';
	}

	override createPass(context: TypedPostNodeContext) {
		const effect = new SepiaEffect();
		const pass = new EffectPass(context.camera, effect);

		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as SepiaEffect;
		effect.intensity = this.pv.amount;
		// pass.uniforms.amount.value = this.pv.amount;
	}
}
