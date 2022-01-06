/**
 * Get the current waveform data of the connected audio source
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Waveform} from 'tone/build/esm/component/analysis/Waveform';
import {AudioNodeAnalyzerType} from '../../poly/NodeContext';

class WaveformAudioParamsConfig extends NodeParamsConfig {
	/** @param array size will be 2**sizeExponent */
	sizeExponent = ParamConfig.INTEGER(8, {
		range: [4, 14],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new WaveformAudioParamsConfig();

export class WaveformAudioNode extends TypedAudioNode<WaveformAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return AudioNodeAnalyzerType.WAVEFORM;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		const size = 2 ** this.pv.sizeExponent;
		const waveform = new Waveform(size);

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(waveform);
		}
		audioBuilder.setAudioNode(waveform);

		this.setAudioBuilder(audioBuilder);
	}
}
