import {TypedSopNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
class NullSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullSopParamsConfig();

export class NullSopNode extends TypedSopNode<NullSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
		this.ui_data.set_border_radius(1000);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		if (core_group) {
			this.set_core_group(core_group);
		} else {
			this.set_objects([]);
		}
	}
}
