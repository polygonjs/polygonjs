/**
 * creates a Synth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {ENVELOPE_DEFAULTS} from './Envelope';
import {Synth} from 'tone/build/esm/instrument/Synth';
import {AudioType} from '../../poly/registers/nodes/types/Audio';
const SYNTH_DEFAULTS = {
	detune: 0,
	portamento: 0,
};

class SynthAudioParamsConfig extends NodeParamsConfig {
	/** @param The glide time between notes. */
	portamento = ParamConfig.FLOAT(SYNTH_DEFAULTS.portamento, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SynthAudioParamsConfig();

export class SynthAudioNode extends TypedAudioNode<SynthAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioType.SYNTH;
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const envelopeBuilder = inputContents[0];
		const envelopeParams = envelopeBuilder.envelopeParams() || ENVELOPE_DEFAULTS;

		const synth = new Synth({
			volume: 0,
			oscillator: {
				type: 'amtriangle',
				harmonicity: 0.5,
				modulationType: 'sine',
			},
			envelope: envelopeParams,
			portamento: this.pv.portamento,
		});

		const audioBuilder = new AudioBuilder();
		audioBuilder.setInstrument(synth);

		this.setAudioBuilder(audioBuilder);
	}
}
