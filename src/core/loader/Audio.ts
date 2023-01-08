import {CoreBaseLoader} from './_Base';
import {AudioContext, FileLoader, Loader, LoadingManager} from 'three';

// rework three AudioLoader, as onError is not called when giving a url that cannot be decoded

type OnLoad = (buffer: AudioBuffer) => void;
type OnProgress = (buffer: ProgressEvent) => void;
type OnError = (event: ErrorEvent) => void;

class AudioLoader extends Loader {
	constructor(public override manager: LoadingManager) {
		super(manager);
	}

	load(url: string, onLoad: OnLoad, onProgress: OnProgress, onError: OnError) {
		const scope = this;

		const loader = new FileLoader(this.manager);
		loader.setResponseType('arraybuffer');
		loader.setPath(this.path);
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);
		loader.load(
			url,
			function (buffer) {
				try {
					if (!(buffer instanceof ArrayBuffer)) {
						onError(new ErrorEvent('file content is not an ArrayBuffer'));
						return;
					}
					// Create a copy of the buffer. The `decodeAudioData` method
					// detaches the buffer when complete, preventing reuse.
					const bufferCopy = buffer.slice(0);

					const context = AudioContext.getContext();
					context.decodeAudioData(
						bufferCopy,
						function (audioBuffer) {
							onLoad(audioBuffer);
						},
						function (event: DOMException) {
							onError(new ErrorEvent('failed to decode file'));
						}
					);
				} catch (e) {
					onError(new ErrorEvent('failed to decode file'));

					scope.manager.itemError(url);
				}
			},
			onProgress,
			onError
		);
	}
}

export class CoreLoaderAudio extends CoreBaseLoader<string> {
	async load(): Promise<AudioBuffer> {
		const audioLoader = new AudioLoader(this.loadingManager);
		const url = await this._urlToLoad();
		return new Promise((resolve, reject) => {
			const onSuccess = (buffer: AudioBuffer) => {
				//console.log('success');
				resolve(buffer);
			};
			const onProgress = (progress: ProgressEvent) => {
				//console.log(progress);
			};
			const onError = (err: any) => {
				console.log(`error:`);
				console.log(err);
				reject();
			};
			audioLoader.load(url, onSuccess, onProgress, onError);
		});
	}
}
