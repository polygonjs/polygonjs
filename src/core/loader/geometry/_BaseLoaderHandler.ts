import {BufferGeometry, Object3D} from 'three';
import type {GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
import type {PDB} from '../../../modules/three/examples/jsm/loaders/PDBLoader';
import {CoreLoaderGeometry} from '../Geometry';
import {BaseLoaderLoadOptions, CoreBaseLoader} from '../_Base';

export type BaseGeoLoaderOutput = Object3D | BufferGeometry | PDB | GLTF;

type OnSuccess<O extends BaseGeoLoaderOutput> = (o: O) => void;
type OnProgress = (n: ProgressEvent<EventTarget>) => void;
type OnError = (event: any) => void;

export abstract class BaseGeoLoader<O extends BaseGeoLoaderOutput> {
	abstract load: (url: string, onSuccess: OnSuccess<O>, onProgress?: OnProgress, onError?: OnError) => void;
}

export abstract class BaseGeoLoaderHandler<O extends BaseGeoLoaderOutput> extends CoreBaseLoader<string> {
	protected _loader: BaseGeoLoader<O> | undefined;

	reset() {
		this._loader = undefined;
	}

	async load(options: BaseLoaderLoadOptions): Promise<Object3D[] | undefined> {
		const loader = await this._getLoader(options);
		if (!loader) {
			console.warn('no loader', this);
			return;
		}

		const url = await this._urlToLoad();

		return new Promise(async (resolve) => {
			CoreLoaderGeometry.incrementInProgressLoadsCount();
			await CoreLoaderGeometry.waitForMaxConcurrentLoadsQueueFreed();
			loader.load(
				url,
				(object: O) => {
					CoreLoaderGeometry.decrementInProgressLoadsCount(url, object);
					const newObjects = this._onLoadSuccess(object);
					resolve(newObjects);
				},
				(progress) => {},
				(event: ErrorEvent) => {
					CoreLoaderGeometry.decrementInProgressLoadsCount(url);
					const message = this._errorMessage(url, event);
					options.node?.states.error.set(message);
				}
			);
		});
	}
	protected _errorMessage(url: string, event: ErrorEvent) {
		return `could not load geometry from ${url} (Error: ${event.message})`;
	}

	protected abstract _getLoader(options: BaseLoaderLoadOptions): Promise<BaseGeoLoader<O>>;
	protected _onLoadSuccess(o: O): Object3D[] {
		if (o instanceof Object3D) {
			return [o];
		} else {
			return [];
		}
	}
}
