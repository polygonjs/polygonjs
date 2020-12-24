/**
 * Adds a horizontal blur effect.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {HorizontalBlurShader} from '../../../modules/three/examples/jsm/shaders/HorizontalBlurShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface HorizontalBlurPassWithUniforms extends ShaderPass {
	uniforms: {
		h: IUniformN;
	};
	resolution_x: number;
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class HorizontalBlurPostParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(2, {
		range: [0, 10],
		range_locked: [true, false],
		step: 0.01,
		...PostParamOptions,
	});
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
}
const ParamsConfig = new HorizontalBlurPostParamsConfig();
export class HorizontalBlurPostNode extends TypedPostProcessNode<ShaderPass, HorizontalBlurPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'horizontal_blur';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(HorizontalBlurShader) as HorizontalBlurPassWithUniforms;
		pass.resolution_x = context.resolution.x;
		this.update_pass(pass);
		return pass;
	}
	update_pass(pass: HorizontalBlurPassWithUniforms) {
		pass.uniforms.h.value = this.pv.amount / (pass.resolution_x * window.devicePixelRatio);
		pass.material.transparent = this.pv.transparent;
	}
}
