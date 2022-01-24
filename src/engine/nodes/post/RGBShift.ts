/**
 * Shift the RGB components.
 *
 *
 */
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
const ParamsConfig = new RGBShiftPostParamsConfig();
export class RGBShiftPostNode extends TypedPostProcessNode<ShaderPass, RGBShiftPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'RGBShift';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(RGBShiftShader) as RGBShiftPassWithUniforms;
		this.updatePass(pass);

		return pass;
	}
	override updatePass(pass: RGBShiftPassWithUniforms) {
		pass.uniforms.amount.value = this.pv.amount;
		pass.uniforms.angle.value = this.pv.angle;
	}
}
