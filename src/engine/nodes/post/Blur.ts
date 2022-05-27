/**
 * Adds a blur effect.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {KawaseBlurPass} from 'postprocessing';

class BlurPostParamsConfig extends NodeParamsConfig {
	/** @param amount */
	amount = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step: 0.01,
		...PostParamOptions,
	});
}
const ParamsConfig = new BlurPostParamsConfig();
export class BlurPostNode extends TypedPostProcessNode<KawaseBlurPass, BlurPostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'blur';
	}

	protected override _createPass(context: TypedPostNodeContext) {
		const pass = new KawaseBlurPass();
		this.updatePass(pass);
		return pass;
	}
	override updatePass(pass: KawaseBlurPass) {
		pass.scale = this.pv.amount;
	}
}
