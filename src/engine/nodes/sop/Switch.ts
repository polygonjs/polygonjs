/**
 * Allows to switch between different inputs.
 *
 *
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const INPUT_NAME = 'geometry to switch to';
class SwitchSopParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			SwitchSopNode.PARAM_CALLBACK_setInputsEvaluation(node as SwitchSopNode);
		},
	});
}
const ParamsConfig = new SwitchSopParamsConfig();

export class SwitchSopNode extends TypedSopNode<SwitchSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.SWITCH;
	}

	static override displayedInputNames(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
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
		const inputIndex = this.pv.input;
		if (!this.io.inputs.hasInput(inputIndex)) {
			this.states.error.set(`no input ${inputIndex}`);
			this.cookController.endCook();
			return;
		}
		const container = await this.containerController.requestInputContainer(inputIndex);
		if (!container) {
			this.states.error.set(`invalid input ${inputIndex}`);
			this.cookController.endCook();
			return;
		}
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.states.error.set(`invalid input ${inputIndex}`);
			this.cookController.endCook();
			return;
		}

		this.setObjects(coreGroup.objects());
	}

	private async _callbackUpdateInputsEvaluation() {
		if (this.p.input.isDirty()) {
			await this.p.input.compute();
		}

		this.io.inputs.listenToSingleInputIndex(this.pv.input);
	}
	static PARAM_CALLBACK_setInputsEvaluation(node: SwitchSopNode) {
		node._callbackUpdateInputsEvaluation();
	}
}
