/**
 * A subnet to create SOP nodes
 *
 */
import {SubnetSopNodeLike} from './utils/subnet/ChildrenDisplayController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NetworkNodeType} from '../../poly/NodeContext';
class SubnetSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetSopParamsConfig();

export class SubnetSopNode extends SubnetSopNodeLike<SubnetSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return NetworkNodeType.SUBNET;
	}

	initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}
}
