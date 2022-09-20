import {LoadingManager, Texture} from 'three';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {Poly} from '../../engine/Poly';
import {BlobsControllerFetchNodeOptions, FetchBlobResponse} from '../../engine/poly/BlobsController';
import {sanitizeUrl} from '../UrlHelper';
import {BaseGeoLoaderOutput} from './geometry/_BaseLoaderHandler';

export interface BaseLoaderLoadOptions {
	node: BaseNodeType;
}

export function modifyUrl(url: string) {
	const remapedUrl = Poly.assetUrls.remapedUrl(url);
	if (remapedUrl) {
		return remapedUrl;
	}

	const blobUrl = Poly.blobs.blobUrl(url);
	if (blobUrl) {
		return blobUrl;
	}

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

export class CoreBaseLoader {
	static readonly loadingManager = LOADING_MANAGER; // static
	public readonly loadingManager = LOADING_MANAGER; // not static

	protected _url: string;
	constructor(url: string, protected _node?: BaseNodeType, public blobOptions: BlobsControllerFetchNodeOptions = {}) {
		this._url = sanitizeUrl(url);
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
		return CoreBaseLoader.extension(this._url);
	}

	protected async _urlToLoad(): Promise<string> {
		let fullUrl = this._url;
		if (this._node) {
			const assetsRoot = this._node.scene().assets.root();
			if (!fullUrl.startsWith('http')) {
				fullUrl = assetsRoot ? `${assetsRoot}/${fullUrl}` : fullUrl;
			}
			await Poly.blobs.fetchBlobForNode({
				fullUrl,
				node: this._node,
				multiAssetsForNode: this.blobOptions.multiAssetsForNode,
			});
		}
		const blobUrl = Poly.blobs.blobUrl(fullUrl);
		return blobUrl || fullUrl;
	}

	protected static async _loadMultipleBlobGlobal(options: MultipleDependenciesLoadOptions) {
		const promises: Promise<FetchBlobResponse>[] = [];
		for (let file of options.files) {
			const fullUrl = file.fullUrl;
			promises.push(Poly.blobs.fetchBlobGlobal(fullUrl));
		}
		const responses = await Promise.all(promises);
		if (options.node) {
			for (let response of responses) {
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
		for (let callback of this._onAssetLoadedCallbacks) {
			callback(url, asset);
		}
	}
}
