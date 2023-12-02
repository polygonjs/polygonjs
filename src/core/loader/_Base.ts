import {LoadingManager, Texture} from 'three';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {Poly} from '../../engine/Poly';
import {BlobsControllerFetchNodeOptions} from '../../engine/poly/BlobsController';
import {isArray} from '../Type';
import {sanitizeUrl} from '../UrlHelper';
import type {BaseGeoLoaderOutput} from './geometry/Common';

export interface BaseLoaderLoadOptions {
	node: BaseNodeType;
}

export function modifyUrl(url: string) {
	const remapedUrl = Poly.assetUrls.remapedUrl(url);
	if (remapedUrl) {
		return remapedUrl;
	}

	// const blobUrl = Poly.blobs.blobUrl(url);
	// if (blobUrl) {
	// 	return blobUrl;
	// }

	return url;
}

export function createLoadingManager() {
	const loadingManager = new LoadingManager();
	loadingManager.setURLModifier(modifyUrl);
	return loadingManager;
}

export const LOADING_MANAGER = createLoadingManager();

interface MultipleDependenciesLoadFileOptions {
	// storedUrl: string;
	fullUrl: string;
}
interface MultipleDependenciesLoadOptions {
	files: MultipleDependenciesLoadFileOptions[];
	error: string;
	node?: BaseNodeType;
}

type OnAssetLoadedCallback = (url: string, asset?: BaseGeoLoaderOutput | Texture) => void;

export class CoreBaseLoader<U extends string | Array<string>> {
	static readonly loadingManager = LOADING_MANAGER; // static
	public readonly loadingManager = LOADING_MANAGER; // not static

	constructor(
		protected _url: U,
		protected _node?: BaseNodeType,
		public blobOptions: BlobsControllerFetchNodeOptions = {}
	) {
		if (isArray(this._url)) {
			this._url = this._url.map(sanitizeUrl) as U;
		} else {
			this._url = sanitizeUrl(this._url) as U;
		}
	}

	static extension(url: string) {
		let ext: string | null = null;

		try {
			const _url = new URL(url);
			ext = _url.searchParams.get('ext');
		} catch (e) {}
		// the loader checks first an 'ext' in the query params
		// for urls such as http://domain.com/file?path=geometry.obj&t=aaa&ext=obj
		// to know what extension it is, since it may not be before the '?'.
		// But if there is not, the part before the '?' is used
		if (!ext) {
			const url_without_params = url.split('?')[0];
			const elements = url_without_params.split('.');
			ext = elements[elements.length - 1].toLowerCase();
			// if (this.ext === 'zip') {
			// 	this.ext = elements[elements.length - 2];
			// }
		}
		return ext;
	}

	extension() {
		return isArray(this._url) ? CoreBaseLoader.extension(this._url[0]) : CoreBaseLoader.extension(this._url);
	}

	protected _urlToLoad(): U {
		const blobOrFullUrl = (fullUrl: string) => {
			if (this._node) {
				const assetsRoot = this._node.scene().assets.root();
				if (!fullUrl.startsWith('http')) {
					fullUrl = assetsRoot ? sanitizeUrl(`${assetsRoot}/${fullUrl}`) : fullUrl;
				}
			}

			return fullUrl;
		};

		if (isArray(this._url)) {
			return this._url.map(blobOrFullUrl) as U;
		} else {
			return blobOrFullUrl(this._url) as U;
		}
	}

	protected static async _loadMultipleUrlsGlobal(options: MultipleDependenciesLoadOptions) {
		const promises: Promise<{error?: string}>[] = [];
		for (const file of options.files) {
			const fullUrl = file.fullUrl;
			const _fetch = async () => {
				const response = await fetch(fullUrl);
				if (response.ok) {
					return {};
				} else {
					return {error: `failed to fetch '${fullUrl}'`};
				}
			};
			promises.push(_fetch());
		}
		const responses = await Promise.all(promises);
		if (options.node) {
			for (const response of responses) {
				if (response.error) {
					options.node.states.error.set(options.error);
				}
			}
		}
	}

	private static _onAssetLoadedCallbacks: OnAssetLoadedCallback[] | undefined;
	static onAssetLoaded(callback: OnAssetLoadedCallback) {
		this._onAssetLoadedCallbacks = this._onAssetLoadedCallbacks || [];
		this._onAssetLoadedCallbacks.push(callback);
	}
	static _runOnAssetLoadedCallbacks(url: string, asset?: BaseGeoLoaderOutput | Texture) {
		if (!this._onAssetLoadedCallbacks) {
			return;
		}
		for (const callback of this._onAssetLoadedCallbacks) {
			callback(url, asset);
		}
	}
}
