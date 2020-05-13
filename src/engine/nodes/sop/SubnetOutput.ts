import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
class SubnetOutputSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SubnetOutputSopParamsConfig();

export class SubnetOutputSopNode extends TypedSopNode<SubnetOutputSopParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'subnet_output'> {
		return 'subnet_output';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.outputs.set_has_no_output();

		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	cook(input_contents: CoreGroup[]) {
		this.set_core_group(input_contents[0]);
	}
}
