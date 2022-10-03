/**
 * luminance pass
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {LuminancePass} from 'postprocessing';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class LuminanceParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new LuminanceParamsConfig();
export class LuminancePostNode extends TypedPostProcessNode<LuminancePass, LuminanceParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'luminance';
	}

	override createPass(context: TypedPostNodeContext) {
		const pass = new LuminancePass();

		return pass;
	}
}
