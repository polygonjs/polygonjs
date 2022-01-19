/**
 * Allows to switch between different inputs.
 *
 *
 *
 */

import {TypedSopNode} from './_Base';

const INPUT_NAME = 'geometry to switch to';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
class SwitchSopParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SwitchSopParamsConfig();

export class SwitchSopNode extends TypedSopNode<SwitchSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'switch';
	}

	static displayedInputNames(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
	}

	initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
		// this.uiData.set_icon('code-branch');

		this.cookController.disallowInputsEvaluation();
	}

	async cook() {
		const input_index = this.pv.input;
		if (this.io.inputs.hasInput(input_index)) {
			const container = await this.containerController.requestInputContainer(input_index);
			if (container) {
				const core_group = container.coreContent();
				if (core_group) {
					this.setCoreGroup(core_group);
					return;
				}
			}
		} else {
			this.states.error.set(`no input ${input_index}`);
		}
		this.cookController.endCook();
	}
}
