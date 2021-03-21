import {LoadingManager} from 'three/src/loaders/LoadingManager';
import {PolyScene} from '../../engine/index_all';
import {Poly} from '../../engine/Poly';

const LOADING_MANAGER = new LoadingManager();
LOADING_MANAGER.setURLModifier((url) => {
	const blobUrl = Poly.blobs.blobUrl(url);
	return blobUrl || url;
});

export class CoreBaseLoader {
	static readonly loadingManager = LOADING_MANAGER;
	public readonly loadingManager = LOADING_MANAGER;

	constructor(protected url: string, protected scene: PolyScene) {}

	protected async _urlToLoad(): Promise<string> {
		let fullUrl = this.url; //.includes('?') ? this.url : `${this.url}?${Date.now()}`;
		const storedUrl = this.url.split('?')[0];
		// const blobUrl = Poly.blobs.blobUrl(resolvedUrl);
		// if (blobUrl) {
		// 	resolvedUrl = blobUrl;
		// } else {
		if (fullUrl[0] != 'h') {
			const assets_root = this.scene.assets.root();
			if (assets_root) {
				fullUrl = `${assets_root}${fullUrl}`;
			}
		}
		// }
		await Poly.blobs.fetchBlob({storedUrl, fullUrl});
		const blobUrl = Poly.blobs.blobUrl(storedUrl);
		return blobUrl || fullUrl;
	}
}
