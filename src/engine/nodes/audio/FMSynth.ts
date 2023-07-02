/**
 * creates a FMSynth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

import {FMSynth} from 'tone/build/esm/instrument/FMSynth';
import {ENVELOPE_DEFAULTS} from './Envelope';
import {AudioType} from '../../poly/registers/nodes/types/Audio';

class FMSynthAudioParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new FMSynthAudioParamsConfig();

export class FMSynthAudioNode extends TypedAudioNode<FMSynthAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioType.FM_SYNTH;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const envelopeBuilder = inputContents[0];
		const envelopeParams = envelopeBuilder.envelopeParams() || ENVELOPE_DEFAULTS;

		const synth = new FMSynth({
			modulationIndex: 12.22,
			envelope: envelopeParams,
			modulation: {
				type: 'square',
			},
			modulationEnvelope: {
				attack: 0.2,
				decay: 0.01,
			},
		});

		const audioBuilder = new AudioBuilder();
		audioBuilder.setInstrument(synth);

		this.setAudioBuilder(audioBuilder);
	}
}
