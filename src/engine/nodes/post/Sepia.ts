import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';
import {SepiaShader} from '../../../../modules/three/examples/jsm/shaders/SepiaShader';
import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

interface SepiaPassWithUniforms extends ShaderPass {
	uniforms: {
		amount: IUniform;
	};
}
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SepiaPostParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(0.5, {
		range: [0, 2],
		range_locked: [false, false],
		callback: PostParamCallback,
	});
}
const ParamsConfig = new SepiaPostParamsConfig();
export class SepiaPostNode extends TypedPostProcessNode<ShaderPass, SepiaPostParamsConfig> {
	params_config = ParamsConfig;
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
