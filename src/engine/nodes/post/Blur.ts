/**
 * Adds a blur effect.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {KawaseBlurPass, KernelSize} from 'postprocessing';
import {KERNEL_SIZES, KERNEL_SIZE_MENU_OPTIONS} from '../../../core/post/KernelSize';

class BlurPostParamsConfig extends NodeParamsConfig {
	/** @param amount */
	amount = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		step: 0.01,
		...PostParamOptions,
	});
	/** @param kernel size */
	kernelSize = ParamConfig.INTEGER(KernelSize.LARGE, {
		...PostParamOptions,
		...KERNEL_SIZE_MENU_OPTIONS,
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
		(pass.blurMaterial as any).kernelSize = KERNEL_SIZES[this.pv.kernelSize];
	}
}
