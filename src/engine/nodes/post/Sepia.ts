import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {SepiaShader} from '../../../modules/three/examples/jsm/shaders/SepiaShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface SepiaPassWithUniforms extends ShaderPass {
	uniforms: {
		amount: IUniformN;
	};
}
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SepiaPostParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(0.5, {
		range: [0, 2],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new SepiaPostParamsConfig();
export class SepiaPostNode extends TypedPostProcessNode<ShaderPass, SepiaPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'sepia';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(SepiaShader) as SepiaPassWithUniforms;

		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: SepiaPassWithUniforms) {
		pass.uniforms.amount.value = this.pv.amount;
	}
}
