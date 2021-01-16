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

	initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}
}
