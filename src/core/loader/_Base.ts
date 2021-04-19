import {LoadingManager} from 'three/src/loaders/LoadingManager';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {Poly} from '../../engine/Poly';
import {FetchBlobResponse} from '../../engine/poly/BlobsController';

const LOADING_MANAGER = new LoadingManager();
LOADING_MANAGER.setURLModifier((url) => {
	const blobUrl = Poly.blobs.blobUrl(url);
	if (blobUrl) {
		return blobUrl;
	}

	const remapedUrl = Poly.assetUrls.remapedUrl(url);
	if (remapedUrl) {
		return remapedUrl;
	}

	return url;
});

interface MultipleDependenciesLoadFileOptions {
	storedUrl: string;
	fullUrl: string;
}
interface MultipleDependenciesLoadOptions {
	files: MultipleDependenciesLoadFileOptions[];
	error: string;
	node: BaseNodeType;
}

export class CoreBaseLoader {
	static readonly loadingManager = LOADING_MANAGER;
	public readonly loadingManager = LOADING_MANAGER;

	constructor(protected _url: string, protected _scene: PolyScene, protected _node?: BaseNodeType) {}

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
		let fullUrl = this._url; //.includes('?') ? this.url : `${this.url}?${Date.now()}`;
		const storedUrl = this._url.split('?')[0];
		// const blobUrl = Poly.blobs.blobUrl(resolvedUrl);
		// if (blobUrl) {
		// 	resolvedUrl = blobUrl;
		// } else {
		if (fullUrl[0] != 'h') {
			const assets_root = this._scene.assets.root();
			if (assets_root) {
				fullUrl = `${assets_root}${fullUrl}`;
			}
		}
		// }
		if (this._node) {
			await Poly.blobs.fetchBlobForNode({storedUrl, fullUrl, node: this._node});
		}
		const blobUrl = Poly.blobs.blobUrl(storedUrl);
		return blobUrl || fullUrl;
	}

	protected static async _loadMultipleBlobGlobal(options: MultipleDependenciesLoadOptions) {
		const promises: Promise<FetchBlobResponse>[] = [];
		for (let file of options.files) {
			const storedUrl = file.storedUrl;
			const fullUrl = file.fullUrl;
			const node = options.node;
			promises.push(Poly.blobs.fetchBlobGlobal({storedUrl, fullUrl, node}));
		}
		const responses = await Promise.all(promises);
		for (let response of responses) {
			if (response.error) {
				options.node.states.error.set(options.error);
			}
		}
	}
}
