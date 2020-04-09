import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {AfterimagePass} from '../../../../modules/three/examples/jsm/postprocessing/AfterimagePass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
interface AfterImagePassWithUniforms extends AfterimagePass {
	uniforms: {
		damp: IUniform;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AfterImagePostParamsConfig extends NodeParamsConfig {
	damp = ParamConfig.FLOAT(0.96, {
		range: [0, 1],
		range_locked: [true, true],
		callback: PostParamCallback,
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
