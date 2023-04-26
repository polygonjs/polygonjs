/**
 * switches between different inputs
 *
 *
 */

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';
import {AudioType} from '../../poly/registers/nodes/types/Audio';

const DEFAULT_INPUTS_COUNT = 4;
class SwitchAudioParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			SwitchAudioNode.PARAM_CALLBACK_setInputsEvaluation(node as SwitchAudioNode);
		},
	});
	/** @param number of inputs that this node can merge geometries from */
	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
		range: [1, 32],
		rangeLocked: [true, false],
		separatorBefore: true,
		callback: (node: BaseNodeType) => {
			SwitchAudioNode.PARAM_CALLBACK_setInputsCount(node as SwitchAudioNode);
		},
	});
}
const ParamsConfig = new SwitchAudioParamsConfig();

export class SwitchAudioNode extends TypedAudioNode<SwitchAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioType.SWITCH;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 4);

		this.io.inputs.onEnsureListenToSingleInputIndexUpdated(async () => {
			await this._callbackUpdateInputsEvaluation();
		});
		this.params.onParamsCreated('update inputs', () => {
			this._callbackUpdateInputsCount();
		});
	}

	override async cook(inputContents: AudioBuilder[]) {
		const inputIndex = this.pv.input;
		if (this.io.inputs.hasInput(inputIndex)) {
			const container = await this.containerController.requestInputContainer(inputIndex);
			if (container) {
				const audioBuilder = container.coreContent();
				if (audioBuilder) {
					this.setAudioBuilder(audioBuilder);
					return;
				}
			}
		} else {
			this.states.error.set(`no input ${inputIndex}`);
		}
	}

	private async _callbackUpdateInputsEvaluation() {
		if (this.p.input.isDirty()) {
			await this.p.input.compute();
		}

		this.io.inputs.listenToSingleInputIndex(this.pv.input);
	}
	static PARAM_CALLBACK_setInputsEvaluation(node: SwitchAudioNode) {
		node._callbackUpdateInputsEvaluation();
	}

	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: SwitchAudioNode) {
		node._callbackUpdateInputsCount();
	}
}
