import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {ClearPass} from '../../../modules/three/examples/jsm/postprocessing/ClearPass';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class ClearPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ClearPostParamsConfig();
export class ClearPostNode extends TypedPostProcessNode<ClearPass, ClearPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'clear';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ClearPass();
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: ClearPass) {}
}
