/**
 * Switch between the different inputs
 *
 */
import {TypedCopNode} from './_Base';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
class SwitchCopParamsConfig extends NodeParamsConfig {
	/** @param input index */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			SwitchCopNode.PARAM_CALLBACK_setInputsEvaluation(node as SwitchCopNode);
		},
	});
}
const ParamsConfig = new SwitchCopParamsConfig();

export class SwitchCopNode extends TypedCopNode<SwitchCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'switch';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
		// this.uiData.set_icon('code-branch');

		this.io.inputs.onEnsureListenToSingleInputIndexUpdated(async () => {
			await this._callbackUpdateInputsEvaluation();
		});
	}

	override async cook() {
		const input_index = this.pv.input;
		if (this.io.inputs.hasInput(input_index)) {
			const container = await this.containerController.requestInputContainer(input_index);
			if (container) {
				this.setTexture(container.texture());
				return;
			}
		} else {
			this.states.error.set(`no input ${input_index}`);
		}
		this.cookController.endCook();
	}

	private async _callbackUpdateInputsEvaluation() {
		if (this.p.input.isDirty()) {
			await this.p.input.compute();
		}

		this.io.inputs.listenToSingleInputIndex(this.pv.input);
	}
	static PARAM_CALLBACK_setInputsEvaluation(node: SwitchCopNode) {
		node._callbackUpdateInputsEvaluation();
	}
}
