import {TypedCopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
class SwitchCopParamsConfig extends NodeParamsConfig {
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		range_locked: [true, true],
	});
}
const ParamsConfig = new SwitchCopParamsConfig();

export class SwitchCopNode extends TypedCopNode<SwitchCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'switch';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
		this.io.inputs.init_inputs_clonable_state([
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
		]);
		this.ui_data.set_width(100);
		// this.ui_data.set_icon('code-branch');

		this.cook_controller.disallow_inputs_evaluation();
	}

	async cook() {
		const input_index = this.pv.input;
		if (this.io.inputs.has_input(input_index)) {
			const container = await this.container_controller.request_input_container(input_index);
			this.set_texture(container.texture());
		} else {
			this.states.error.set(`no input ${input_index}`);
		}
	}
}
