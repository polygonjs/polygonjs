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
import {NodeEvent} from '../../poly/NodeEvent';

const INPUT_NAME = 'geometry to switch to';
const DEFAULT_INPUTS_COUNT = 4;
class SwitchSopParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, false],
		callback: (node: BaseNodeType) => {
			SwitchSopNode.PARAM_CALLBACK_setInputsEvaluation(node as SwitchSopNode);
		},
	});
	/** @param number of inputs that this node can merge geometries from */
	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
		range: [1, 32],
		rangeLocked: [true, false],
		separatorBefore: true,
		callback: (node: BaseNodeType) => {
			SwitchSopNode.PARAM_CALLBACK_setInputsCount(node as SwitchSopNode);
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
		this.params.onParamsCreated('update inputs', () => {
			this._callbackUpdateInputsCount();
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

		this.setObjects(coreGroup.allObjects());
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
	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: SwitchSopNode) {
		node._callbackUpdateInputsCount();
	}
}
