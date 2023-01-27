/**
 * Noise/grain effect
 *
 *
 */
import {Vector2} from 'three';
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EffectPass, NoiseEffect} from 'postprocessing';
class NoisePostParamsConfig extends NodeParamsConfig {
	/** @param effect strength */
	strength = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param premultiply */
	premultiply = ParamConfig.BOOLEAN(1, {
		...PostParamOptions,
	});
}
const ParamsConfig = new NoisePostParamsConfig();
export class NoisePostNode extends TypedPostNode<EffectPass, NoisePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'noise';
	}

	private _rendererSize = new Vector2();
	override createPass(context: TypedPostNodeContext) {
		context.renderer.getSize(this._rendererSize);
		const effect = new NoiseEffect({});
		const pass = new EffectPass(context.camera, effect);
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as NoiseEffect;
		effect.premultiply = this.pv.premultiply;
		effect.blendMode.opacity.value = this.pv.strength;
	}
}
