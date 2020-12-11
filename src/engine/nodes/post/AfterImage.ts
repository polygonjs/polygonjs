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
	damp = ParamConfig.FLOAT(0.96, {
		range: [0, 1],
		range_locked: [true, true],
		...PostParamOptions,
	});
}
const ParamsConfig = new AfterImagePostParamsConfig();
export class AfterImagePostNode extends TypedPostProcessNode<AfterImagePassWithUniforms, AfterImagePostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'after_image';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new AfterimagePass() as AfterImagePassWithUniforms;
		this.update_pass(pass);
		return pass;
	}
	update_pass(pass: AfterImagePassWithUniforms) {
		pass.uniforms.damp.value = this.pv.damp;
	}
}
