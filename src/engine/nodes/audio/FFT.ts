/**
 * creates a fast fourier transform analyzer
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {FFT} from 'tone/build/esm/component/analysis/FFT';
import {AudioNodeAnalyzerType} from '../../poly/NodeContext';

class FFTAudioParamsConfig extends NodeParamsConfig {
	/** @param array size will be 2**sizeExponent */
	sizeExponent = ParamConfig.INTEGER(8, {
		range: [4, 14],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new FFTAudioParamsConfig();

export class FFTAudioNode extends TypedAudioNode<FFTAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return AudioNodeAnalyzerType.FFT;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		const size = 2 ** this.pv.sizeExponent;
		const fft = new FFT(size);

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(fft);
		}
		audioBuilder.setAudioNode(fft);

		this.setAudioBuilder(audioBuilder);
	}
}
