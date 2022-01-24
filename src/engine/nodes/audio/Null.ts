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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'null';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		this.setAudioBuilder(audioBuilder);
	}
}
