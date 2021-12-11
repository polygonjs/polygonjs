/**
 * import an audio file
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Player} from 'tone/build/esm/source/buffer/Player';
class FileAudioParamsConfig extends NodeParamsConfig {
	/** @param url to fetch the audio file from */
	url = ParamConfig.STRING('');
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
	private _loadUrl(): Promise<Player> {
		return new Promise((resolve) => {
			const player = new Player({
				url: this.pv.url,
				loop: true,
				volume: 6,
				onload: () => {
					resolve(player);
				},
			});
		});
	}
}
