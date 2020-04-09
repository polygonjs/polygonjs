import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {CopyShader} from '../../../../modules/three/examples/jsm/shaders/CopyShader';
import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

interface CopyPassWithUniforms extends ShaderPass {
	uniforms: {
		opacity: IUniform;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class CopyPostParamsConfig extends NodeParamsConfig {
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		range_locked: [true, true],
		callback: PostParamCallback,
	});
}
const ParamsConfig = new CopyPostParamsConfig();
export class CopyPostNode extends TypedPostProcessNode<ShaderPass, CopyPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'copy';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(CopyShader) as CopyPassWithUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: CopyPassWithUniforms) {
		pass.uniforms.opacity.value = this.pv.opacity;
	}
}
