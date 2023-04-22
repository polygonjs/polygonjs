import {Object3D} from 'three';
import {CoreObjectType, ObjectContent} from '../../geometry/ObjectContent';
import {CoreLoaderGeometry} from '../Geometry';
import {BaseLoaderLoadOptions, CoreBaseLoader} from '../_Base';

import type {BaseGeoLoaderOutput, OnSuccess, OnProgress, OnError} from './Common';
import {isPromise} from '../../Type';

export abstract class BaseGeoLoader<O extends BaseGeoLoaderOutput> {
	abstract load: (url: string, onSuccess: OnSuccess<O>, onProgress?: OnProgress, onError?: OnError) => void;
}

export abstract class BaseLoaderHandler<
	O extends BaseGeoLoaderOutput,
	OC extends ObjectContent<CoreObjectType>
> extends CoreBaseLoader<string> {
	protected _loader: BaseGeoLoader<O> | undefined;

	reset() {
		this._loader = undefined;
	}

	async load(options: BaseLoaderLoadOptions): Promise<OC[] | undefined> {
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
					const result = this._onLoadSuccess(object);
					if (isPromise(result)) {
						result.then((newObjects) => {
							resolve(newObjects);
						});
					} else {
						resolve(result);
					}
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
	protected abstract _onLoadSuccess(o: O): OC[] | Promise<OC[]>;
}

export abstract class BaseObject3DLoaderHandler<O extends BaseGeoLoaderOutput> extends BaseLoaderHandler<O, Object3D> {
	protected _onLoadSuccess(o: O): Object3D[] | Promise<Object3D[]> {
		if (o instanceof Object3D) {
			return [o];
		} else {
			return [];
		}
	}
}
