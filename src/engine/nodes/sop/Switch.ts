import {TypedSopNode} from './_Base';

const INPUT_NAME = 'geometry to switch to';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
class SwitchSopParamsConfig extends NodeParamsConfig {
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		range_locked: [true, true],
	});
}
const ParamsConfig = new SwitchSopParamsConfig();

export class SwitchSopNode extends TypedSopNode<SwitchSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'switch';
	}

	static displayed_input_names(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
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
		this.ui_data.set_icon('code-branch');

		this.cook_controller.disallow_inputs_evaluation();
	}

	//do_clone_inputs: -> false

	// to not have to eval all inputs
	// async evaluate_inputs_and_params() {
	// 	await this.eval_all_params();
	// }

	async cook() {
		if (this.io.inputs.has_input(this.pv.input)) {
			const container = await this.container_controller.request_input_container(this.pv.input);
			this.set_core_group(container.core_content());
		} else {
			this.states.error.set(`no input ${this.pv.input}`);
		}
	}
}
