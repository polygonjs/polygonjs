/**
 * Shift the RGB components.
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {ChromaticAberrationEffect, EffectPass} from 'postprocessing';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Vector2} from 'three';

const v2 = new Vector2();

class ChromaticAberrationPostParamsConfig extends NodeParamsConfig {
	/** @param effect amount */
	amount = ParamConfig.FLOAT(0.005, {
		range: [0, 0.01],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect dir */
	direction = ParamConfig.VECTOR2([1, 1], {
		...PostParamOptions,
	});
}
const ParamsConfig = new ChromaticAberrationPostParamsConfig();
export class ChromaticAberrationPostNode extends TypedPostNode<EffectPass, ChromaticAberrationPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'chromaticAberration';
	}

	override createPass(context: TypedPostNodeContext) {
		const effect = new ChromaticAberrationEffect();
		const pass = new EffectPass(context.camera, effect);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as ChromaticAberrationEffect;
		v2.copy(this.pv.direction).normalize().multiplyScalar(this.pv.amount);
		effect.offset.copy(v2);
		// pass.uniforms.amount.value = this.pv.amount;
		// pass.uniforms.angle.value = this.pv.angle;
	}
}
