/**
 * Adds a vignette.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {VignetteShader} from '../../../modules/three/examples/jsm/shaders/VignetteShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface VignettePassWithUniforms extends ShaderPass {
	uniforms: {
		offset: IUniformN;
		darkness: IUniformN;
	};
}
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class VignettePostParamsConfig extends NodeParamsConfig {
	/** @param offset */
	offset = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [false, false],
		...PostParamOptions,
	});
	/** @param darkness */
	darkness = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new VignettePostParamsConfig();

export class VignettePostNode extends TypedPostProcessNode<ShaderPass, VignettePostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'vignette';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(VignetteShader) as VignettePassWithUniforms;
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: VignettePassWithUniforms) {
		pass.uniforms.offset.value = this.pv.offset;
		pass.uniforms.darkness.value = this.pv.darkness;
	}
}
