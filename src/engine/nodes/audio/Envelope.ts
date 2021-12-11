/**
 * creates an envelope that can be given to synths
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder, EnvelopeParamsType} from '../../../core/audio/AudioBuilder';
export const ENVELOPE_DEFAULTS: EnvelopeParamsType = {
	attackCurve: 'linear',
	attack: 0.01,
	decayCurve: 'exponential',
	decay: 0.1,
	releaseCurve: 'exponential',
	release: 1,
	sustain: 0.5,
};

class EnvelopeAudioParamsConfig extends NodeParamsConfig {
	/** @param The amount of time it takes for the envelope to go from 0 to it's maximum value. */
	attack = ParamConfig.FLOAT(ENVELOPE_DEFAULTS.attack as number, {
		range: [0, 0.1],
		rangeLocked: [true, false],
	});
	/** The period of time after the attack that it takes for the envelope to fall to the sustain value. */
	decay = ParamConfig.FLOAT(ENVELOPE_DEFAULTS.decay as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** The percent of the maximum value that the envelope rests at until the release is triggered. */
	sustain = ParamConfig.FLOAT(ENVELOPE_DEFAULTS.sustain as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** The amount of time after the release is triggered it takes to reach 0. */
	release = ParamConfig.FLOAT(ENVELOPE_DEFAULTS.release as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new EnvelopeAudioParamsConfig();

export class EnvelopeAudioNode extends TypedAudioNode<EnvelopeAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'enveloppe';
	}

	initializeNode() {
		this.io.inputs.setCount(0);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = new AudioBuilder();
		audioBuilder.setEnvelopeParams({
			attackCurve: 'linear',
			attack: this.pv.attack,
			decayCurve: 'exponential',
			decay: this.pv.decay,
			releaseCurve: 'exponential',
			release: this.pv.release,
			sustain: this.pv.sustain,
		});

		this.setAudioBuilder(audioBuilder);
	}
}
