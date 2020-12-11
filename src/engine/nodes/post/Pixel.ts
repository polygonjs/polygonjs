import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {PixelShader} from '../../../modules/three/examples/jsm/shaders/PixelShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN, IUniformV2} from '../utils/code/gl/Uniforms';

interface PixelPassWithUniforms extends ShaderPass {
	uniforms: {
		resolution: IUniformV2;
		pixelSize: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PixelPostParamsConfig extends NodeParamsConfig {
	pixel_size = ParamConfig.INTEGER(16, {
		range: [1, 50],
		range_locked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new PixelPostParamsConfig();
export class PixelPostNode extends TypedPostProcessNode<ShaderPass, PixelPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'pixel';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(PixelShader) as PixelPassWithUniforms;
		pass.uniforms.resolution.value = context.resolution;
		pass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio);
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: PixelPassWithUniforms) {
		pass.uniforms.pixelSize.value = this.pv.pixel_size;
	}
}
