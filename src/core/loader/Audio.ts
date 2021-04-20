import {CoreBaseLoader} from './_Base';
import {AudioLoader} from 'three/src/loaders/AudioLoader';

enum Extension {
	MP3 = 'mp3',
	WAV = 'wav',
}
export const AUDIO_EXTENSIONS: Extension[] = [Extension.MP3, Extension.WAV];

export class CoreLoaderAudio extends CoreBaseLoader {
	async load(): Promise<AudioBuffer> {
		const audioLoader = new AudioLoader(this.loadingManager);
		const url = await this._urlToLoad();
		return new Promise((resolve) => {
			audioLoader.load(url, function (buffer) {
				resolve(buffer);
			});
		});
	}
}
