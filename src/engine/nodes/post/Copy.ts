import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {CopyShader} from '../../../modules/three/examples/jsm/shaders/CopyShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';
interface CopyPassWithUniforms extends ShaderPass {
	uniforms: {
		opacity: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class CopyPostParamsConfig extends NodeParamsConfig {
	opacity = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
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
		pass.material.transparent = this.pv.transparent;
	}
}
