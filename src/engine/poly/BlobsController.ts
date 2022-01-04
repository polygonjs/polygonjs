import {PolyScene} from '../scene/PolyScene';
import {BaseNodeType} from '../nodes/_Base';
import {Poly} from '../Poly';
import {createObjectURL} from '../../core/BlobUtils';
import {PolyDictionary} from '../../types/GlobalTypes';
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
interface PartialBlobData {
	storedUrl: string;
	fullUrl?: string;
}
export interface FetchBlobResponse {
	blobData?: BlobData;
	error?: string;
}

export class BlobsController {
	private _blobUrlsByStoredUrl: Map<string, string> = new Map();
	private _blobsByStoredUrl: Map<string, Blob> = new Map();
	private _blobDataByNodeId: Map<number, BlobData> = new Map();
	private _globalBlobsByStoredUrl: Map<string, Blob> = new Map();
	private _scene: PolyScene | undefined;
	registerBlobUrl(data: BlobUrlData) {
		if (!Poly.playerMode()) {
			return;
		}
		this._blobUrlsByStoredUrl.set(data.storedUrl, data.blobUrl);
	}
	deregisterUrl(url: string) {
		this._blobUrlsByStoredUrl.delete(url);
	}
	blobUrl(storedUrl: string) {
		return this._blobUrlsByStoredUrl.get(storedUrl);
	}
	clear() {
		this._blobUrlsByStoredUrl.clear();
		this._blobsByStoredUrl.clear();
		this._blobDataByNodeId.clear();
		this._globalBlobsByStoredUrl.clear();
	}
	private _clearBlobForNode(node: BaseNodeType) {
		const blobData = this._blobDataByNodeId.get(node.graphNodeId());
		if (blobData) {
			this._blobsByStoredUrl.delete(blobData.storedUrl);
			this._blobUrlsByStoredUrl.delete(blobData.storedUrl);
		}
		this._blobDataByNodeId.delete(node.graphNodeId());
	}
	private _assignBlobToNode(node: BaseNodeType, blobData: BlobData) {
		this._clearBlobForNode(node);
		this._blobDataByNodeId.set(node.graphNodeId(), {
			storedUrl: blobData.storedUrl,
			fullUrl: blobData.fullUrl,
		});
	}

	async fetchBlobGlobal(options: FetchBlobUrlOptions): Promise<FetchBlobResponse> {
		if (Poly.playerMode()) {
			return {};
		}
		try {
			const existingBlob = this._blobUrlsByStoredUrl.get(options.storedUrl);
			// no need to fetch if we already have it
			if (existingBlob) {
				return {};
			}

			const remapedUrl = Poly.assetUrls.remapedUrl(options.fullUrl);
			const response = await fetch(remapedUrl || options.fullUrl);
			if (response.ok) {
				const blob = await response.blob();
				this._blobsByStoredUrl.set(options.storedUrl, blob);
				this._blobUrlsByStoredUrl.set(options.storedUrl, this.createBlobUrl(blob));
				this._globalBlobsByStoredUrl.set(options.storedUrl, blob);

				return {
					blobData: {
						storedUrl: options.storedUrl,
						fullUrl: options.fullUrl,
					},
				};
			} else {
				return {error: `failed to fetch ${options.fullUrl}`};
			}
		} catch (err) {
			return {error: `failed to fetch ${options.fullUrl}`};
		}
	}

	async fetchBlobForNode(options: FetchBlobUrlOptions) {
		if (Poly.playerMode()) {
			return {};
		}

		try {
			const existingBlob = this._blobUrlsByStoredUrl.get(options.storedUrl);
			// no need to fetch if we already have it
			if (existingBlob) {
				return {};
			}
			const remapedUrl = Poly.assetUrls.remapedUrl(options.fullUrl);
			const response = await fetch(remapedUrl || options.fullUrl);
			if (response.ok) {
				const blob = await response.blob();
				this._blobsByStoredUrl.set(options.storedUrl, blob);
				this._blobUrlsByStoredUrl.set(options.storedUrl, this.createBlobUrl(blob));
				// the scene is given here to the blobsController, although that is not ideal.
				// TODO: think on how the blobsController could be given the scene in a more predictable way.
				this._scene = options.node.scene();
				this._assignBlobToNode(options.node, {
					storedUrl: options.storedUrl,
					fullUrl: options.fullUrl,
				});
				return {
					blobData: {
						storedUrl: options.storedUrl,
						fullUrl: options.fullUrl,
					},
				};
			} else {
				return {error: `failed to fetch ${options.fullUrl}`};
			}
		} catch (err) {
			return {error: `failed to fetch ${options.fullUrl}`};
		}
	}
	forEachBlob(callback: (blob: Blob, blobData: PartialBlobData) => void) {
		// we first go through the nodes and their assigned blobs
		this._blobDataByNodeId.forEach((blobData, nodeGraphNodeId) => {
			if (this._scene) {
				const node = this._scene.graph.nodeFromId(nodeGraphNodeId);
				if (node) {
					const {storedUrl} = blobData;
					const blob = this._blobsByStoredUrl.get(storedUrl);
					if (blob) {
						callback(blob, blobData);
					}
				}
			}
		});
		// and then we go through the global blobs
		// and sort the storedUrl to have the order being predictable
		let storedUrls: string[] = [];
		const blobsByStoreUrl: Map<string, Blob> = new Map();
		this._globalBlobsByStoredUrl.forEach((blob, storedUrl) => {
			storedUrls.push(storedUrl);
			blobsByStoreUrl.set(storedUrl, blob);
		});
		storedUrls = storedUrls.sort();
		storedUrls.forEach((storedUrl) => {
			const blob = this._globalBlobsByStoredUrl.get(storedUrl);
			if (blob) {
				callback(blob, {storedUrl});
			}
		});
	}
	createBlobUrl(blob: Blob) {
		return createObjectURL(blob);
	}
	assetsManifestWithBlobsMap() {
		const manifest: PolyDictionary<string> = {};
		const blobsMap: Map<string, Blob> = new Map();
		const blobs: Blob[] = [];
		const fullUrls: string[] = [];
		const storedUrls: string[] = [];
		Poly.blobs.forEachBlob((blob, blobData) => {
			blobs.push(blob);
			const fullUrl = blobData.fullUrl;
			if (fullUrl) {
				fullUrls.push(fullUrl);
			}
			storedUrls.push(blobData.storedUrl);
		});
		for (let i = 0; i < blobs.length; i++) {
			const paramUrl = storedUrls[i];
			const blob = blobs[i];
			const assetShortName = paramUrl.split('?')[0];
			const elements = paramUrl.split('.');
			const ext = elements[elements.length - 1];
			const assignedName = `${i}.${ext}`;
			const fileNameInZip = `assets/${assignedName}`;
			blobsMap.set(fileNameInZip, blob);
			manifest[assetShortName] = assignedName;
		}
		return {
			manifest,
			blobsMap,
			fullUrls,
			storedUrls,
		};
	}
}
