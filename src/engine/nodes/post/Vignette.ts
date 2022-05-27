/**
 * Adds a vignette.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EffectPass, VignetteEffect, VignetteTechnique} from 'postprocessing';
class VignettePostParamsConfig extends NodeParamsConfig {
	/** @param offset */
	offset = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param darkness */
	darkness = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new VignettePostParamsConfig();

export class VignettePostNode extends TypedPostProcessNode<EffectPass, VignettePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vignette';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const effect = new VignetteEffect({
			technique: VignetteTechnique.DEFAULT,
			offset: 0.0,
			darkness: 1.0,
		});

		const pass = new EffectPass(context.camera, effect);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		// pass.uniforms.offset.value = this.pv.offset;
		// pass.uniforms.darkness.value = this.pv.darkness;
	}
}
