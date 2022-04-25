import {Texture} from 'three';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {CoreUserAgent} from '../UserAgent';
import {CoreBaseLoader} from './_Base';

type MaxConcurrentLoadsCountMethod = () => number;
type OnTextureLoadedCallback = (url: string, texture: Texture) => void;

export class CoreLoaderTexture extends CoreBaseLoader {
	constructor(_url: string, protected override _node: BaseNodeType) {
		super(_url, _node);
	}

	static _onTextureLoadedCallback: OnTextureLoadedCallback | undefined;
	static onTextureLoaded(callback: OnTextureLoadedCallback | undefined) {
		this._onTextureLoadedCallback = callback;
	}

	// static pixelData(texture: Texture) {
	// 	const img = texture.image;
	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = img.width;
	// 	canvas.height = img.height;
	// 	const context = canvas.getContext('2d');
	// 	if (context) {
	// 		context.drawImage(img, 0, 0, img.width, img.height);
	// 		return context.getImageData(0, 0, img.width, img.height);
	// 	}
	// }

	static replaceExtension(url: string, new_extension: string) {
		const elements = url.split('?');
		const url_without_params = elements[0];
		const url_elements = url_without_params.split('.');
		url_elements.pop();
		url_elements.push(new_extension);
		return [url_elements.join('.'), elements[1]].join('?');
	}

	//
	//
	// CONCURRENT LOADS
	//
	//
	private static MAX_CONCURRENT_LOADS_COUNT: number = CoreLoaderTexture._init_max_concurrent_loads_count();
	private static CONCURRENT_LOADS_DELAY: number = CoreLoaderTexture._init_concurrent_loads_delay();
	private static in_progress_loads_count: number = 0;
	private static _queue: Array<() => void> = [];
	private static _maxConcurrentLoadsCountMethod: MaxConcurrentLoadsCountMethod | undefined;
	public static setMaxConcurrentLoadsCount(method: MaxConcurrentLoadsCountMethod | undefined) {
		this._maxConcurrentLoadsCountMethod = method;
	}
	private static _init_max_concurrent_loads_count(): number {
		if (this._maxConcurrentLoadsCountMethod) {
			return this._maxConcurrentLoadsCountMethod();
		}
		return CoreUserAgent.isChrome() ? 10 : 4;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // limit to 4 for non chrome,
		// // as firefox was seen hanging trying to load multiple glb files
		// // limit to 1 for safari,
		// if (name) {
		// 	const loads_count_by_browser: PolyDictionary<number> = {
		// 		Chrome: 10,
		// 		Firefox: 4,
		// 	};
		// 	const loads_count = loads_count_by_browser[name];
		// 	if (loads_count != null) {
		// 		return loads_count;
		// 	}
		// }
		// return 1;
	}
	private static _init_concurrent_loads_delay(): number {
		return CoreUserAgent.isChrome() ? 0 : 10;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // add a delay for browsers other than Chrome and Firefox
		// if (name) {
		// 	const delay_by_browser: PolyDictionary<number> = {
		// 		Chrome: 0,
		// 		Firefox: 10,
		// 	};
		// 	const delay = delay_by_browser[name];
		// 	if (delay != null) {
		// 		return delay;
		// 	}
		// }
		// return 100;
	}
	// public static override_max_concurrent_loads_count(count: number) {
	// 	this.MAX_CONCURRENT_LOADS_COUNT = count;
	// }

	static incrementInProgressLoadsCount() {
		this.in_progress_loads_count++;
	}
	static decrementInProgressLoadsCount() {
		this.in_progress_loads_count--;

		const queued_resolve = this._queue.pop();
		if (queued_resolve) {
			const delay = this.CONCURRENT_LOADS_DELAY;
			setTimeout(() => {
				queued_resolve();
			}, delay);
		}
	}

	static async waitForMaxConcurrentLoadsQueueFreed(): Promise<void> {
		if (this.in_progress_loads_count <= this.MAX_CONCURRENT_LOADS_COUNT) {
			return;
		} else {
			return new Promise((resolve) => {
				this._queue.push(resolve);
			});
		}
	}
}
