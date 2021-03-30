import {PolyScene} from '../scene/PolyScene';
import {BaseNodeType} from '../nodes/_Base';
import {Poly} from '../Poly';

export interface BlobUrlData {
	storedUrl: string;
	blobUrl: string;
}
export interface FetchBlobUrlOptions {
	storedUrl: string;
	fullUrl: string;
	node: BaseNodeType;
}
interface BlobData {
	storedUrl: string;
	fullUrl: string;
}

export class BlobsController {
	private _blobUrlsByUrl: Map<string, string> = new Map();
	private _blobsByUrl: Map<string, Blob> = new Map();
	private _blobDataByNodeId: Map<number, BlobData> = new Map();
	private _scene: PolyScene | undefined;
	registerBlobUrl(data: BlobUrlData) {
		if (!Poly.playerMode()) {
			return;
		}
		this._blobUrlsByUrl.set(data.storedUrl, data.blobUrl);
	}
	blobUrl(storedUrl: string) {
		return this._blobUrlsByUrl.get(storedUrl);
	}
	clear() {
		this._blobUrlsByUrl.clear();
		this._blobsByUrl.clear();
		this._blobDataByNodeId.clear();
	}

	async fetchBlob(options: FetchBlobUrlOptions) {
		if (Poly.playerMode()) {
			return;
		}

		try {
			const existingBlob = this._blobsByUrl.get(options.storedUrl);
			// no need to fetch if we already have it
			if (existingBlob) {
				return;
			}

			const response = await fetch(options.fullUrl);
			const blob = await response.blob();
			this._blobsByUrl.set(options.storedUrl, blob);
			// the scene is given here to the blobsController, although that is not ideal.
			// TODO: think on how the blobsController could be given the scene in a more predictable way.
			this._scene = options.node.scene();
			this._blobDataByNodeId.set(options.node.graphNodeId(), {
				storedUrl: options.storedUrl,
				fullUrl: options.fullUrl,
			});
			this._blobUrlsByUrl.set(options.storedUrl, this.createBlobUrl(blob));
			return;
		} catch (err) {
			return;
		}
	}
	forEachBlob(callback: (blob: Blob, storedUrl: string, node: BaseNodeType) => void) {
		return this._blobDataByNodeId.forEach((blobData, nodeGraphNodeId) => {
			if (this._scene) {
				const node = this._scene.graph.nodeFromId(nodeGraphNodeId);
				if (node) {
					const {storedUrl} = blobData;
					const blob = this._blobsByUrl.get(storedUrl);
					if (blob) {
						callback(blob, storedUrl, node as BaseNodeType);
					}
				}
			}
		});
	}
	createBlobUrl(blob: Blob) {
		const urlCreator = window.URL || window.webkitURL;
		return urlCreator.createObjectURL(blob);
	}
}
