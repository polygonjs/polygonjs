/**
 * creates a meter, which can read the raw value of the signal
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Meter} from 'tone/build/esm/component/analysis/Meter';
import {AudioNodeAnalyzerType} from '../../poly/NodeContext';

class MeterAudioParamsConfig extends NodeParamsConfig {
	/** @param a value from between 0 and 1 where 0 represents no time averaging with the last analysis frame */
	smoothing = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new MeterAudioParamsConfig();

export class MeterAudioNode extends TypedAudioNode<MeterAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return AudioNodeAnalyzerType.METER;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		const meter = new Meter(this.pv.smoothing);

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(meter);
		}
		audioBuilder.setAudioNode(meter);

		this.setAudioBuilder(audioBuilder);
	}
}
