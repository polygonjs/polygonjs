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
	/** @param restart the audio */
	restart = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_restart(node as FileAudioNode);
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
		await this._loadUrl();
		if (this._player) {
			const audioBuilder = new AudioBuilder();
			audioBuilder.setSource(this._player);
			this.setAudioBuilder(audioBuilder);
		} else {
			this.cookController.endCook();
		}
	}
	private _player: Player | undefined;
	private async _loadUrl(): Promise<Player | void> {
		try {
			const loader = new CoreLoaderAudio(this.pv.url, this.scene(), this);
			const buffer = await loader.load();

			return new Promise((resolve) => {
				if (this._player) {
					this._player.dispose();
				}

				this._player = new Player({
					url: buffer,
					loop: isBooleanTrue(this.pv.loop),
					volume: 0,
					// no onload event if a buffer is provided instead of a url
					// onload: () => {
					// 	resolve(player);
					// },
				});
				if (isBooleanTrue(this.pv.autostart)) {
					this._player.start();
				}
				resolve(this._player);
			});
		} catch (err) {
			this.states.error.set(`failed to load url '${this.pv.url}'`);
			return;
		}
	}
	async play(): Promise<void> {
		this._player?.start();
	}
	async pause() {
		this._player?.stop();
	}
	async restart() {
		this._player?.seek(0);
	}

	static PARAM_CALLBACK_play(node: FileAudioNode) {
		node.play();
	}
	static PARAM_CALLBACK_pause(node: FileAudioNode) {
		node.pause();
	}
	static PARAM_CALLBACK_restart(node: FileAudioNode) {
		node.restart();
	}
}
