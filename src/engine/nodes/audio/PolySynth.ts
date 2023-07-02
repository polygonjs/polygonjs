/**
 * creates a PolySynth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {PolySynth} from 'tone/build/esm/instrument/PolySynth';
import {Synth} from 'tone/build/esm/instrument/Synth';
import {AudioType} from '../../poly/registers/nodes/types/Audio';

class PolySynthAudioParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PolySynthAudioParamsConfig();

export class PolySynthAudioNode extends TypedAudioNode<PolySynthAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioType.POLY_SYNTH;
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override cook(inputContents: AudioBuilder[]) {
		const synth = new PolySynth(Synth, {
			oscillator: {
				partials: [0, 2, 3, 4],
			},
		});

		const audioBuilder = new AudioBuilder();
		audioBuilder.setInstrument(synth);

		this.setAudioBuilder(audioBuilder);
	}
}
