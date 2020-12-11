import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {RGBShiftShader} from '../../../modules/three/examples/jsm/shaders/RGBShiftShader';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN} from '../utils/code/gl/Uniforms';

interface RGBShiftPassWithUniforms extends ShaderPass {
	uniforms: {
		amount: IUniformN;
		angle: IUniformN;
	};
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class RGBShiftPostParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(0.005, {
		range: [0, 1],
		range_locked: [true, false],
		...PostParamOptions,
	});
	angle = ParamConfig.FLOAT(0, {
		range: [0, 10],
		range_locked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new RGBShiftPostParamsConfig();
export class RGBShiftPostNode extends TypedPostProcessNode<ShaderPass, RGBShiftPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'rgb_shift';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(RGBShiftShader) as RGBShiftPassWithUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: RGBShiftPassWithUniforms) {
		pass.uniforms.amount.value = this.pv.amount;
		pass.uniforms.angle.value = this.pv.angle;
	}
}
