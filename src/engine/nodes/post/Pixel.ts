/**
 * Pixelize the render.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EffectPass, PixelationEffect} from 'postprocessing';

class PixelPostParamsConfig extends NodeParamsConfig {
	/** @param pixelSize */
	pixelSize = ParamConfig.INTEGER(16, {
		range: [1, 50],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new PixelPostParamsConfig();
export class PixelPostNode extends TypedPostProcessNode<EffectPass, PixelPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'pixel';
	}

	override createPass(context: TypedPostNodeContext) {
		const effect = new PixelationEffect(5);
		// context.renderer.getSize(this._rendererSize);
		const pass = new EffectPass(context.camera, effect);
		// pass.uniforms.resolution.value = this._rendererSize;
		// pass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: EffectPass) {
		const effect = (pass as any).effects[0] as PixelationEffect;
		effect.granularity = this.pv.pixelSize;
		// pass.uniforms.pixelSize.value = this.pv.pixelSize;
	}
}
