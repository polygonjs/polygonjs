/**
 * Adds a FXAA effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {FXAAShader} from '../../../modules/three/examples/jsm/shaders/FXAAShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformV2} from '../utils/code/gl/Uniforms';

interface FXAAPassWithUniforms extends ShaderPass {
	uniforms: {
		resolution: IUniformV2;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class FXAAPostParamsConfig extends NodeParamsConfig {
	/** @param transparent */
	transparent = ParamConfig.BOOLEAN(1, PostParamOptions);
}
const ParamsConfig = new FXAAPostParamsConfig();
export class FXAAPostNode extends TypedPostProcessNode<ShaderPass, FXAAPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'FXAA';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(FXAAShader) as FXAAPassWithUniforms;
		pass.uniforms.resolution.value.set(1 / context.resolution.x, 1 / context.resolution.y);
		pass.material.transparent = true;
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: FXAAPassWithUniforms) {
		pass.material.transparent = this.pv.transparent;
	}
}
