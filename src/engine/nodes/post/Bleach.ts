/**
 * Creates a bleach effect
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {BleachBypassShader} from '../../../modules/three/examples/jsm/shaders/BleachBypassShader';

import {IUniformN} from '../utils/code/gl/Uniforms';

interface BleachPassWithUniforms extends ShaderPass {
	uniforms: {
		opacity: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class BleachPostParamsConfig extends NodeParamsConfig {
	/** @param opacity */
	opacity = ParamConfig.FLOAT(0.95, {
		range: [-5, 5],
		rangeLocked: [true, true],
		...PostParamOptions,
	});
}
const ParamsConfig = new BleachPostParamsConfig();
export class BleachPostNode extends TypedPostProcessNode<ShaderPass, BleachPostParamsConfig> {
	override paramsConfig = ParamsConfig;

	static override type() {
		return 'bleach';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(BleachBypassShader) as BleachPassWithUniforms;
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: BleachPassWithUniforms) {
		pass.uniforms.opacity.value = this.pv.opacity;
	}
}
