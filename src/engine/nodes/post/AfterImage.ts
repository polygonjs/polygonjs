/**
 * Adds An AfterImage effect, where the previous render remains and only slowly fades away.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {AfterimagePass} from '../../../modules/three/examples/jsm/postprocessing/AfterimagePass';
import {IUniformN} from '../utils/code/gl/Uniforms';
interface AfterImagePassWithUniforms extends AfterimagePass {
	uniforms: {
		damp: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AfterImagePostParamsConfig extends NodeParamsConfig {
	/** @param damping */
	damp = ParamConfig.FLOAT(0.96, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
}
const ParamsConfig = new AfterImagePostParamsConfig();
export class AfterImagePostNode extends TypedPostProcessNode<AfterImagePassWithUniforms, AfterImagePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'afterImage';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new AfterimagePass() as AfterImagePassWithUniforms;
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: AfterImagePassWithUniforms) {
		pass.uniforms.damp.value = this.pv.damp;
	}
}
