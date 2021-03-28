import {CoreBaseLoader} from './_Base';
import {AudioLoader} from 'three/src/loaders/AudioLoader';

export class CoreLoaderAudio extends CoreBaseLoader {
	async load(): Promise<AudioBuffer> {
		const audioLoader = new AudioLoader();
		const url = await this._urlToLoad();
		return new Promise((resolve) => {
			audioLoader.load(url, function (buffer) {
				resolve(buffer);
			});
		});
	}
}
