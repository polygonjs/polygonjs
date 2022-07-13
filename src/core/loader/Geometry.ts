import {CoreUserAgent} from '../UserAgent';
import {CoreBaseLoader} from './_Base';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseGeoLoaderOutput} from './geometry/_BaseLoaderHandler';

export enum GeometryFormat {
	AUTO = 'auto',
	JSON = 'json',
}
export const GEOMETRY_FORMATS: GeometryFormat[] = [GeometryFormat.AUTO, GeometryFormat.JSON];

type MaxConcurrentLoadsCountMethod = () => number;
interface CoreLoaderGeometryOptions {
	url: string;
	format: GeometryFormat;
}
export class CoreLoaderGeometry extends CoreBaseLoader {
	constructor(protected _options: CoreLoaderGeometryOptions, protected override _node: BaseNodeType) {
		super(_options.url, _node);
	}

	//
	//
	// CONCURRENT LOADS
	//
	//
	private static MAX_CONCURRENT_LOADS_COUNT: number = CoreLoaderGeometry._initMaxConcurrentLoadsCount();
	private static CONCURRENT_LOADS_DELAY: number = CoreLoaderGeometry._initConcurrentLoadsDelay();
	private static _inProgressLoadsCount: number = 0;
	private static _queue: Array<() => void> = [];
	private static _maxConcurrentLoadsCountMethod: MaxConcurrentLoadsCountMethod | undefined;
	public static setMaxConcurrentLoadsCount(method: MaxConcurrentLoadsCountMethod | undefined) {
		this._maxConcurrentLoadsCountMethod = method;
	}
	private static _initMaxConcurrentLoadsCount(): number {
		if (this._maxConcurrentLoadsCountMethod) {
			return this._maxConcurrentLoadsCountMethod();
		}
		return CoreUserAgent.isChrome() ? 4 : 1;
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
	private static _initConcurrentLoadsDelay(): number {
		return CoreUserAgent.isChrome() ? 1 : 10;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // add a delay for browsers other than Chrome and Firefox
		// if (name) {
		// 	const delay_by_browser: PolyDictionary<number> = {
		// 		Chrome: 1,
		// 		Firefox: 10,
		// 		Safari: 10,
		// 	};
		// 	const delay = delay_by_browser[name];
		// 	if (delay != null) {
		// 		return delay;
		// 	}
		// }
		// return 10;
	}
	// public static override_max_concurrent_loads_count(count: number) {
	// 	this.MAX_CONCURRENT_LOADS_COUNT = count;
	// }

	static incrementInProgressLoadsCount() {
		this._inProgressLoadsCount++;
	}
	static decrementInProgressLoadsCount(url: string, object?: BaseGeoLoaderOutput) {
		this._inProgressLoadsCount--;

		const queuedResolve = this._queue.pop();
		if (queuedResolve) {
			const delay = this.CONCURRENT_LOADS_DELAY;
			setTimeout(() => {
				queuedResolve();
			}, delay);
		}
		this._runOnAssetLoadedCallbacks(url, object);
	}

	static async waitForMaxConcurrentLoadsQueueFreed(): Promise<void> {
		if (this._inProgressLoadsCount <= this.MAX_CONCURRENT_LOADS_COUNT) {
			return;
		} else {
			return new Promise((resolve) => {
				this._queue.push(resolve);
			});
		}
	}
}
