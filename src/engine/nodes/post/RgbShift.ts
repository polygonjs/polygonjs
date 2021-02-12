/**
 * Shift the RGB components.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {RGBShiftShader} from '../../../modules/three/examples/jsm/shaders/RGBShiftShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface RgbShiftPassWithUniforms extends ShaderPass {
	uniforms: {
		amount: IUniformN;
		angle: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class RgbShiftPostParamsConfig extends NodeParamsConfig {
	/** @param effect amount */
	amount = ParamConfig.FLOAT(0.005, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param effect angle */
	angle = ParamConfig.FLOAT(0, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new RgbShiftPostParamsConfig();
export class RgbShiftPostNode extends TypedPostProcessNode<ShaderPass, RgbShiftPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'rgbShift';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(RGBShiftShader) as RgbShiftPassWithUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: RgbShiftPassWithUniforms) {
		pass.uniforms.amount.value = this.pv.amount;
		pass.uniforms.angle.value = this.pv.angle;
	}
}
