/**
 * A subnet to create SOP nodes
 *
 */
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class SubnetSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetSopParamsConfig();

export class SubnetSopNode extends SubnetSopNodeLike<SubnetSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'subnet';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}
}
