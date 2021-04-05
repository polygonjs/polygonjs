import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {ClearMaskPass} from '../../../modules/three/examples/jsm/postprocessing/MaskPass';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class ClearMaskPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ClearMaskPostParamsConfig();
export class ClearMaskPostNode extends TypedPostProcessNode<ClearMaskPass, ClearMaskPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'clearMask';
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new ClearMaskPass();
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: ClearMaskPass) {}
}
