/**
 * Pixelize the render.
 *
 *
 */
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
	/** @param pixelSize */
	pixelSize = ParamConfig.INTEGER(16, {
		range: [1, 50],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new PixelPostParamsConfig();
export class PixelPostNode extends TypedPostProcessNode<ShaderPass, PixelPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'pixel';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(PixelShader) as PixelPassWithUniforms;
		pass.uniforms.resolution.value = context.resolution;
		pass.uniforms.resolution.value.multiplyScalar(window.devicePixelRatio);
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: PixelPassWithUniforms) {
		pass.uniforms.pixelSize.value = this.pv.pixelSize;
	}
}
