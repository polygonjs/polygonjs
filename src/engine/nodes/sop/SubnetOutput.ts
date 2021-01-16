/**
 * Sets which node is used as the output of a parent subnet node.
 *
 * @remarks
 * Can only be created inside a subnet SOP.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NetworkChildNodeType} from '../../poly/NodeContext';
class SubnetOutputSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputSopParamsConfig();

export class SubnetOutputSopNode extends TypedSopNode<SubnetOutputSopParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.outputs.set_has_no_output();

		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	cook(input_contents: CoreGroup[]) {
		this.setCoreGroup(input_contents[0]);
	}
}
