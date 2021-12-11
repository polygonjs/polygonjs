import {start} from 'tone/build/esm/core/Global';

export class AudioControllerClass {
	private static _instance: AudioControllerClass;
	static instance() {
		return (this._instance = this._instance || new AudioControllerClass());
	}
	private _started = false;
	async start() {
		if (this._started) {
			return;
		}
		await start();
		return;
	}
}
export const AudioController = AudioControllerClass.instance();
