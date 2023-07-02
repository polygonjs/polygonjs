/**
 * creates an AMSynth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

import {AMSynth} from 'tone/build/esm/instrument/AMSynth';
import {ENVELOPE_DEFAULTS} from './Envelope';
import {AudioType} from '../../poly/registers/nodes/types/Audio';

class AMSynthAudioParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AMSynthAudioParamsConfig();

export class AMSynthAudioNode extends TypedAudioNode<AMSynthAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioType.AM_SYNTH;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const envelopeBuilder = inputContents[0];
		const envelopeParams = envelopeBuilder.envelopeParams() || ENVELOPE_DEFAULTS;

		const synth = new AMSynth({
			harmonicity: 2.5,
			oscillator: {
				type: 'fatsawtooth',
			},
			envelope: envelopeParams,
			modulation: {
				type: 'square',
			},
			modulationEnvelope: {
				attack: 0.5,
				decay: 0.01,
			},
		});

		const audioBuilder = new AudioBuilder();
		audioBuilder.setInstrument(synth);

		this.setAudioBuilder(audioBuilder);
	}
}
