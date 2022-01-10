/**
 * creates an amplitude envelope to analyse sounds
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {AmplitudeEnvelope} from 'tone/build/esm/component/envelope/AmplitudeEnvelope';

interface AmplitudeEnvelopeParams {
	attack: number;
	decay: number;
	release: number;
	sustain: number;
}

export const ENVELOPE_DEFAULTS: AmplitudeEnvelopeParams = {
	attack: 0.01,
	decay: 0.1,
	release: 1,
	sustain: 0.5,
};

class AmplitudeEnvelopeAudioParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new AmplitudeEnvelopeAudioParamsConfig();

export class AmplitudeEnvelopeAudioNode extends TypedAudioNode<AmplitudeEnvelopeAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'amplitudeEnveloppe';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		const ampEnv = new AmplitudeEnvelope({
			attack: this.pv.attack,
			decay: this.pv.decay,
			release: this.pv.release,
			sustain: this.pv.sustain,
		});

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(ampEnv);
		}
		// audioBuilder.setInstrument(ampEnv);
		audioBuilder.setAudioNode(ampEnv);

		this.setAudioBuilder(audioBuilder);
	}
}
