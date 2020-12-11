import {TypedPostProcessNode} from './_Base';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullPostParamsConfig();
export class NullPostNode extends TypedPostProcessNode<Pass, NullPostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}
}
