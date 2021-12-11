/**
 * null node, useful to gather inputs together
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {AudioController} from '../../../core/audio/AudioController';

class PlaySourceAudioParamsConfig extends NodeParamsConfig {
	/** @param play the audio */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlaySourceAudioNode.PARAM_CALLBACK_play(node as PlaySourceAudioNode);
		},
	});
	/** @param stop the audio */
	stop = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlaySourceAudioNode.PARAM_CALLBACK_stop(node as PlaySourceAudioNode);
		},
	});
}
const ParamsConfig = new PlaySourceAudioParamsConfig();

export class PlaySourceAudioNode extends TypedAudioNode<PlaySourceAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'playSource';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		this.setAudioBuilder(audioBuilder);
	}
	async play(): Promise<void> {
		const source = await this._getSource();
		if (!source) {
			console.log('no source');
			return;
		}
		await AudioController.start();

		source.start();
	}
	async stop() {
		const source = await this._getSource();
		if (!source) {
			return;
		}
		source.stop();
	}
	private async _getSource() {
		if (this.isDirty()) {
			await this.compute();
		}
		const audioBuilder = this.containerController.container().coreContent();
		if (!audioBuilder) {
			return;
		}
		return audioBuilder.source();
	}

	static PARAM_CALLBACK_play(node: PlaySourceAudioNode) {
		node.play();
	}
	static PARAM_CALLBACK_stop(node: PlaySourceAudioNode) {
		node.stop();
	}
}
