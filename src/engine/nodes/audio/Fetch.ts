/**
 * imports an audio node from another network
 *
 *
 */

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {NodeContext} from '../../poly/NodeContext';
class FetchAudioParamsConfig extends NodeParamsConfig {
	/** @param which node to import */
	audioNode = ParamConfig.NODE_PATH('');
}
const ParamsConfig = new FetchAudioParamsConfig();

export class FetchAudioNode extends TypedAudioNode<FetchAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'fetch';
	}

	initializeNode() {
		this.io.inputs.setCount(0);
	}

	async cook(inputContents: AudioBuilder[]) {
		const baseAudioNode = this.pv.audioNode.nodeWithContext(NodeContext.AUDIO);
		if (!baseAudioNode) {
			this.states.error.set('no audio node found');
			return;
		}
		const audioContainer = await baseAudioNode.compute();
		const audioBuilder = audioContainer.coreContentCloned();
		if (!audioBuilder) {
			this.states.error.set('invalid audio node');
			return;
		}

		this.setAudioBuilder(audioBuilder);
	}
}
