/**
 * Adds a vertical blur effect.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {VerticalBlurShader} from '../../../modules/three/examples/jsm/shaders/VerticalBlurShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface VerticalBlurPassWithUniforms extends ShaderPass {
	uniforms: {
		v: IUniformN;
	};
	resolution_y: number;
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class VerticalBlurPostParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(2, {
		range: [0, 10],
		range_locked: [true, false],
		step: 0.01,
		...PostParamOptions,
	});
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
}
const ParamsConfig = new VerticalBlurPostParamsConfig();
export class VerticalBlurPostNode extends TypedPostProcessNode<ShaderPass, VerticalBlurPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'verticalBlur';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(VerticalBlurShader) as VerticalBlurPassWithUniforms;
		pass.resolution_y = context.resolution.y;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: VerticalBlurPassWithUniforms) {
		pass.uniforms.v.value = this.pv.amount / (pass.resolution_y * window.devicePixelRatio);
		pass.material.transparent = this.pv.transparent;
	}
}
