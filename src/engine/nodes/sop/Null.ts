import {TypedSopNode} from './_Base';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {NullSopOperation} from '../../../core/operation/sop/Null';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullSopParamsConfig();

export class NullSopNode extends TypedSopNode<NullSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
		// this.ui_data.set_border_radius(1000);
	}

	private _operation = new NullSopOperation();
	cook(input_contents: CoreGroup[]) {
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
