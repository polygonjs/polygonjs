/**
 * import an audio file
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {CoreLoaderAudio} from '../../../core/loader/Audio';
import {isBooleanTrue} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {AudioController} from '../../../core/audio/AudioController';
class FileAudioParamsConfig extends NodeParamsConfig {
	/** @param url to fetch the audio file from */
	url = ParamConfig.STRING('');
	/** @param auto start */
	autostart = ParamConfig.BOOLEAN(1);
	/** @param loop */
	loop = ParamConfig.BOOLEAN(1);
	/** @param play the audio */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_play(node as FileAudioNode);
		},
	});
	/** @param stop the audio */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_pause(node as FileAudioNode);
		},
	});
}
const ParamsConfig = new FileAudioParamsConfig();

export class FileAudioNode extends TypedAudioNode<FileAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'file';
	}

	initializeNode() {
		this.io.inputs.setCount(0);
	}

	async cook(inputContents: AudioBuilder[]) {
		const player = await this._loadUrl();
		const audioBuilder = new AudioBuilder();
		audioBuilder.setSource(player);
		this.setAudioBuilder(audioBuilder);
	}
	private async _loadUrl(): Promise<Player> {
		const loader = new CoreLoaderAudio(this.pv.url, this.scene(), this);
		const buffer = await loader.load();

		return new Promise((resolve) => {
			const player = new Player({
				url: buffer,
				loop: isBooleanTrue(this.pv.loop),
				volume: 0,
				// no onload event if a buffer is provided instead of a url
				// onload: () => {
				// 	resolve(player);
				// },
			});
			if (isBooleanTrue(this.pv.autostart)) {
				player.start();
			}
			resolve(player);
		});
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
	async pause() {
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

	static PARAM_CALLBACK_play(node: FileAudioNode) {
		node.play();
	}
	static PARAM_CALLBACK_pause(node: FileAudioNode) {
		node.pause();
	}
}
