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
		this.lifecycle.add_on_create_hook(this._on_create_bound);
	}

	private _on_create_bound = this._on_create.bind(this);
	private _on_create() {
		const subnet_input1 = this.create_node('subnet_input');
		const subnet_output1 = this.create_node('subnet_output');

		subnet_input1.ui_data.set_position(0, -100);
		subnet_output1.ui_data.set_position(0, +100);
	}
}
