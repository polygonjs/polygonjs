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
class SopSubnetOutputSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SopSubnetOutputSopParamsConfig();

export class SubnetOutputSopNode extends TypedSopNode<SopSubnetOutputSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<NetworkChildNodeType.OUTPUT> {
		return NetworkChildNodeType.OUTPUT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.outputs.setHasNoOutput();

		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(input_contents: CoreGroup[]) {
		this.setCoreGroup(input_contents[0]);
	}
}
