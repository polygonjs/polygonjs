/**
 *  FrequencyShifter can be used to shift all frequencies of a signal by a fixed amount.
 * The amount can be changed at audio rate and the effect is applied in real time.
 * The frequency shifting is implemented with a technique called single side band modulation using a ring modulator.
 * Note: Contrary to pitch shifting, all frequencies are shifted by the same amount,
 * destroying the harmonic relationship between them. This leads to the classic ring modulator timbre distortion.
 * The algorithm will produces some aliasing towards the high end, especially if your source material
 * contains a lot of high frequencies. Unfortunatelly the webaudio API does not support resampling
 * buffers in real time, so it is not possible to fix it properly. Depending on the use case it might
 * be an option to low pass filter your input before frequency shifting it to get ride of the aliasing.
 * You can find a very detailed description of the algorithm here: https://larzeitlin.github.io/RMFS/
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 *
 *
 */

import {FrequencyShifter} from 'tone/build/esm/effect/FrequencyShifter';
const DEFAULTS = FrequencyShifter.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class FrequencyShifterAudioParamsConfig extends NodeParamsConfig {
	/** @param frequency */
	frequency = ParamConfig.FLOAT(DEFAULTS.frequency as number, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new FrequencyShifterAudioParamsConfig();

export class FrequencyShifterAudioNode extends TypedAudioNode<FrequencyShifterAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'frequencyShifter';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = new FrequencyShifter({
			frequency: this.pv.frequency,
		});

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
}
