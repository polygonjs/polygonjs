/**
 * Switch between the different inputs
 *
 */
import {TypedCopNode} from './_Base';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SwitchCopParamsConfig extends NodeParamsConfig {
	/** @param input index */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SwitchCopParamsConfig();

export class SwitchCopNode extends TypedCopNode<SwitchCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'switch';
	}

	initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
		// this.uiData.set_icon('code-branch');

		this.cookController.disallow_inputs_evaluation();
	}

	async cook() {
		const input_index = this.pv.input;
		if (this.io.inputs.has_input(input_index)) {
			const container = await this.containerController.requestInputContainer(input_index);
			if (container) {
				this.set_texture(container.texture());
				return;
			}
		} else {
			this.states.error.set(`no input ${input_index}`);
		}
		this.cookController.endCook();
	}
}
