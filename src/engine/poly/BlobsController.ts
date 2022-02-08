import {BaseNodeType} from '../nodes/_Base';
import {Poly} from '../Poly';
import {createObjectURL} from '../../core/BlobUtils';
import {CoreGraphNodeId} from '../../core/graph/CoreGraph';
import {PolyDictionary} from '../../types/GlobalTypes';
export interface BlobUrlData {
	// storedUrl: string;
	blobUrl: string;
}
export interface BlobsControllerFetchNodeOptions {
	multiAssetsForNode?: boolean;
}
export interface FetchNodeBlobUrlOptions extends BlobsControllerFetchNodeOptions {
	// storedUrl: string;
	fullUrl: string;
	node: BaseNodeType;
}
// interface BlobData {
// 	// storedUrl: string;
// 	fullUrl: string;
// }
// interface PartialBlobData {
// 	// storedUrl: string;
// 	fullUrl?: string;
// }

export interface FetchBlobResponse {
	blobWrapper?: BlobWrapper;
	error?: string;
}

interface BlobWrapper {
	blob: Blob;
	blobUrl: string;
	referringNodeIds: Set<CoreGraphNodeId>;
}
// interface GlobalBlobWrapper extends BlobWrapper {}

// interface NodeBlobWrapper extends BlobWrapper {
// 	nodeId: CoreGraphNodeId;
// }
interface BlobCallbackParams {
	url: string;
	blobWrapper: BlobWrapper;
}
type BlobCallback = (params: BlobCallbackParams) => void;
export class BlobsController {
	private _blobWrappersByUrl: Map<string, BlobWrapper> = new Map();
	// private _nodeBlobWrappersByFullUrl: Map<string, NodeBlobWrapper> = new Map();
	constructor() {}

	recording() {
		return !Poly.playerMode();
	}

	// private _blobUrlsByStoredUrl: Map<string, string> = new Map();
	// private _blobsByStoredUrl: Map<string, Blob> = new Map();
	// private _blobDataByNodeId: Map<number, BlobData[]> = new Map();
	// private _globalBlobsByStoredUrl: Map<string, Blob> = new Map();

	// registerBlobUrl(data: BlobUrlData) {
	// 	if (!Poly.playerMode()) {
	// 		return;
	// 	}
	// 	this._blobUrlsByStoredUrl.set(data.storedUrl, data.blobUrl);
	// }
	// deregisterUrl(url: string) {
	// 	this._blobUrlsByStoredUrl.delete(url);
	// }
	blobUrl(url: string) {
		return this._blobWrappersByUrl.get(url)?.blobUrl;
	}
	clear() {
		this._blobWrappersByUrl.clear();
		// this._nodeBlobWrappersByFullUrl.clear();
		// this._blobUrlsByStoredUrl.clear();
		// this._blobsByStoredUrl.clear();
		// this._blobDataByNodeId.clear();
		// this._globalBlobsByStoredUrl.clear();
	}
	clearBlobsForNode(node: BaseNodeType) {
		const urls: string[] = [];
		const nodeId = node.graphNodeId();
		this._blobWrappersByUrl.forEach((blobWrapper, url) => {
			if (blobWrapper.referringNodeIds.has(nodeId)) {
				urls.push(url);
			}
		});
		for (let url of urls) {
			const wrapper = this._blobWrappersByUrl.get(url);
			if (wrapper) {
				if (wrapper.referringNodeIds.size == 1) {
					this._blobWrappersByUrl.delete(url);
				} else {
					wrapper.referringNodeIds.delete(nodeId);
				}
			}
		}

		// const blobData = this._blobDataByNodeId.get(node.graphNodeId());
		// if (blobData) {
		// 	const firstEntry = blobData[0];
		// 	if (firstEntry) {
		// 		this._blobsByStoredUrl.delete(firstEntry.storedUrl);
		// 		this._blobUrlsByStoredUrl.delete(firstEntry.storedUrl);
		// 	}
		// }
		// this._blobDataByNodeId.delete(node.graphNodeId());
	}
	private _assignBlobToNode(
		url: string,
		node: BaseNodeType,
		blobWrapper: BlobWrapper,
		options: BlobsControllerFetchNodeOptions = {}
	) {
		if (options.multiAssetsForNode != true) {
			this.clearBlobsForNode(node);
		}

		this._blobWrappersByUrl.set(url, blobWrapper);

		// MapUtils.pushOnArrayAtEntry(this._blobDataByNodeId, node.graphNodeId(), {
		// 	storedUrl: blobData.storedUrl,
		// 	fullUrl: blobData.fullUrl,
		// });
		// this._blobDataByNodeId.set(node.graphNodeId(), {
		// 	storedUrl: blobData.storedUrl,
		// 	fullUrl: blobData.fullUrl,
		// });
	}

	async fetchBlobGlobal(url: string): Promise<FetchBlobResponse> {
		if (!this.recording()) {
			return {};
		}
		try {
			const existingBlobWrapper = this._blobWrappersByUrl.get(url);
			// no need to fetch if we already have it
			if (existingBlobWrapper) {
				return {blobWrapper: existingBlobWrapper};
			}

			const remapedUrl = Poly.assetUrls.remapedUrl(url) || url;
			const response = await fetch(remapedUrl);
			if (response.ok) {
				const blob = await response.blob();

				const blobWrapper: BlobWrapper = {
					blob,
					blobUrl: this._createBlobUrl(blob),
					referringNodeIds: new Set(),
				};
				this._blobWrappersByUrl.set(url, blobWrapper);
				// this._blobsByStoredUrl.set(options.storedUrl, blob);
				// this._blobUrlsByStoredUrl.set(options.storedUrl, this.createBlobUrl(blob));
				// this._globalBlobsByStoredUrl.set(options.storedUrl, blob);

				return {
					blobWrapper,
				};
			} else {
				return {error: `failed to fetch ${remapedUrl}`};
			}
		} catch (err) {
			return {error: `failed to fetch ${url}`};
		}
	}

	async fetchBlobForNode(options: FetchNodeBlobUrlOptions) {
		if (!this.recording()) {
			return {};
		}

		try {
			const nodeId = options.node.graphNodeId();
			const existingBlobWrapper = this._blobWrappersByUrl.get(options.fullUrl);
			// no need to fetch if we already have it
			if (existingBlobWrapper) {
				existingBlobWrapper.referringNodeIds.add(nodeId);
				return {blobWrapper: existingBlobWrapper};
			}
			const remapedUrl = Poly.assetUrls.remapedUrl(options.fullUrl) || options.fullUrl;
			const response = await fetch(remapedUrl);
			if (response.ok) {
				const blob = await response.blob();
				const referringNodeIds = new Set<CoreGraphNodeId>();
				referringNodeIds.add(nodeId);
				const blobWrapper: BlobWrapper = {
					blob,
					blobUrl: this._createBlobUrl(blob),
					referringNodeIds,
				};
				// this._nodeBlobWrappersByFullUrl.set(options.fullUrl, blobWrapper)
				// this._blobsByStoredUrl.set(options.storedUrl, blob);
				// this._blobUrlsByStoredUrl.set(options.storedUrl, this.createBlobUrl(blob));
				// the scene is given here to the blobsController, although that is not ideal.
				// TODO: think on how the blobsController could be given the scene in a more predictable way.
				// this._scene = options.node.scene();
				this._assignBlobToNode(options.fullUrl, options.node, blobWrapper, {
					multiAssetsForNode: options.multiAssetsForNode,
				});
				return {
					blobWrapper,
				};
			} else {
				return {error: `failed to fetch ${options.fullUrl}`};
			}
		} catch (err) {
			return {error: `failed to fetch ${options.fullUrl}`};
		}
	}
	traverse(callback: BlobCallback) {
		// - 1 - we first go through the nodes and their assigned blobs
		// - 2 - and then we go through the global blobs
		// and sort the url to have the order being predictable
		const _forEachBlob = (isGlobal: boolean, callback: BlobCallback) => {
			const urls: string[] = [];
			this._blobWrappersByUrl.forEach((blobWrapper, url) => {
				const isWrapperGlobal = blobWrapper.referringNodeIds.size == 0;
				if (isWrapperGlobal == isGlobal) {
					urls.push(url);
				}
			});
			urls.sort();
			for (let url of urls) {
				const blobWrapper = this._blobWrappersByUrl.get(url);
				if (blobWrapper) {
					const params: BlobCallbackParams = {
						url,
						blobWrapper,
					};
					callback(params);
				}
			}
		};

		_forEachBlob(true, callback);
		_forEachBlob(false, callback);

		// this._blobDataByNodeId.forEach((blobData, nodeGraphNodeId) => {
		// 	if (this._scene) {
		// 		const node = this._scene.graph.nodeFromId(nodeGraphNodeId);
		// 		if (node) {
		// 			for (let blobDataEntry of blobData) {
		// 				const {storedUrl} = blobDataEntry;
		// 				const blob = this._blobsByStoredUrl.get(storedUrl);
		// 				if (blob) {
		// 					callback(blob, blobDataEntry);
		// 				}
		// 			}
		// 		}
		// 	}
		// });

		// let storedUrls: string[] = [];
		// const blobsByStoreUrl: Map<string, Blob> = new Map();
		// this._globalBlobsByStoredUrl.forEach((blob, storedUrl) => {
		// 	storedUrls.push(storedUrl);
		// 	blobsByStoreUrl.set(storedUrl, blob);
		// });
		// storedUrls = storedUrls.sort();
		// storedUrls.forEach((storedUrl) => {
		// 	const blob = this._globalBlobsByStoredUrl.get(storedUrl);
		// 	if (blob) {
		// 		callback(blob, {storedUrl});
		// 	}
		// });
	}
	private _createBlobUrl(blob: Blob) {
		return createObjectURL(blob);
	}
	assetsManifestWithBlobsMap() {
		const manifest: PolyDictionary<string> = {};
		const blobsMap: Map<string, Blob> = new Map();
		const blobs: Blob[] = [];
		const fullUrls: string[] = [];
		// const storedUrls: string[] = [];
		this.traverse((params) => {
			blobs.push(params.blobWrapper.blob);
			const fullUrl = params.url;
			fullUrls.push(fullUrl);
			// storedUrls.push(blobData.storedUrl);
		});
		for (let i = 0; i < blobs.length; i++) {
			const paramUrl = fullUrls[i];
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
			// fullUrls,
			// storedUrls,
		};
	}
}
