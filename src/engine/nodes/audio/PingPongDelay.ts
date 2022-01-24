/**
 * PingPongDelay is a feedback delay effect where the echo is heard
 * first in one channel and next in the opposite channel. In a stereo
 * system these are the right and left channels.
 * PingPongDelay in more simplified terms is two Tone.FeedbackDelays
 * with independent delay values. Each delay is routed to one channel
 * (left or right), and the channel triggered second will always
 * trigger at the same interval after the first.
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */

import {PingPongDelay} from 'tone/build/esm/effect/PingPongDelay';
const DEFAULTS = PingPongDelay.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class PingPongDelayAudioParamsConfig extends NodeParamsConfig {
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
}
const ParamsConfig = new PingPongDelayAudioParamsConfig();

export class PingPongDelayAudioNode extends TypedAudioNode<PingPongDelayAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'pingPongDelay';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = this._createEffect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}

	private _createEffect() {
		return new PingPongDelay({
			delayTime: this.pv.delayTime,
			maxDelay: this.pv.maxDelay,
		});
	}
}
