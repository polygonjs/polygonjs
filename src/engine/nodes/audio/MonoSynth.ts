/**
 * creates a monoSynth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

import {MonoSynth} from 'tone/build/esm/instrument/MonoSynth';
import {PolySynth} from 'tone/build/esm/instrument/PolySynth';
import {ENVELOPE_DEFAULTS} from './Envelope';

class MonoSynthAudioParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MonoSynthAudioParamsConfig();

export class MonoSynthAudioNode extends TypedAudioNode<MonoSynthAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'monoSynth';
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const envelopeBuilder = inputContents[0];
		const envelopeParams = envelopeBuilder.envelopeParams() || ENVELOPE_DEFAULTS;

		const synth = new PolySynth(MonoSynth, {
			volume: -8,
			oscillator: {
				type: 'square8',
			},
			envelope: envelopeParams,
			filterEnvelope: {
				attack: 0.001,
				decay: 0.7,
				sustain: 0.1,
				release: 0.8,
				baseFrequency: 300,
				octaves: 4,
			},
		});

		const audioBuilder = new AudioBuilder();
		audioBuilder.setInstrument(synth);

		this.setAudioBuilder(audioBuilder);
	}
}
