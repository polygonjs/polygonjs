/**
 *  FeedbackDelay is a DelayNode in which part of output signal is fed back into the delay.
 *
 *
 */

import {FeedbackDelay} from 'tone/build/esm/effect/FeedbackDelay';
const DEFAULTS = {
	delayTime: 0.25,
	feedback: 0.125,
	maxDelay: 1,
	// wet: 1,
}; //FeedbackDelay.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class FeedbackDelayAudioParamsConfig extends NodeParamsConfig {
	/** @param delayTime */
	delayTime = ParamConfig.FLOAT(DEFAULTS.delayTime as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param maxDelay */
	maxDelay = ParamConfig.FLOAT(DEFAULTS.maxDelay as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param feedback */
	feedback = ParamConfig.FLOAT(DEFAULTS.feedback as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new FeedbackDelayAudioParamsConfig();

export class FeedbackDelayAudioNode extends TypedAudioNode<FeedbackDelayAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'feedbackDelay';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = new FeedbackDelay({
			delayTime: this.pv.delayTime,
			maxDelay: this.pv.maxDelay,
			feedback: this.pv.feedback,
		});

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
}
