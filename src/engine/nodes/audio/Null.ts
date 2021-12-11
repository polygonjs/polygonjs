/**
 * null node, useful to gather inputs together
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class NullAudioParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullAudioParamsConfig();

export class NullAudioNode extends TypedAudioNode<NullAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'null';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		this.setAudioBuilder(audioBuilder);
	}
}
