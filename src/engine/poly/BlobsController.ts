import {BaseNodeType} from '../nodes/_Base';
import {Poly} from '../Poly';
import {createObjectURL} from '../../core/BlobUtils';
import {CoreGraphNodeId} from '../../core/graph/CoreGraph';
import {PolyDictionary} from '../../types/GlobalTypes';
export interface BlobUrlData {
	blobUrl: string;
}
export interface BlobsControllerFetchNodeOptions {
	multiAssetsForNode?: boolean;
}
export interface FetchNodeBlobUrlOptions extends BlobsControllerFetchNodeOptions {
	fullUrl: string;
	node: BaseNodeType;
}

export interface FetchBlobResponse {
	blobWrapper?: BlobWrapper;
	error?: string;
}

interface BlobWrapper {
	blob: Blob;
	blobUrl: string;
	referringNodeIds: Set<CoreGraphNodeId>;
}

interface BlobData {
	url: string;
	blobWrapper: BlobWrapper;
}
type BlobDataCallback = (params: BlobData) => void;
export class BlobsController {
	private _blobWrappersByUrl: Map<string, BlobWrapper> = new Map();
	constructor() {}

	recording() {
		return !Poly.playerMode();
	}

	blobUrl(url: string) {
		return this._blobWrappersByUrl.get(url)?.blobUrl;
	}
	clear() {
		this._blobWrappersByUrl.clear();
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

		const currentBlobWrapper = this._blobWrappersByUrl.get(url);
		if (currentBlobWrapper) {
			currentBlobWrapper.referringNodeIds.add(node.graphNodeId());
		} else {
			this._blobWrappersByUrl.set(url, blobWrapper);
		}
	}

	async setVirtualFile(file: File, uniqueId: string) {
		const blob: Blob = file;
		const blobWrapper: BlobWrapper = {
			blob,
			blobUrl: this._createBlobUrl(file),
			referringNodeIds: new Set(),
		};
		this._blobWrappersByUrl.set(uniqueId, blobWrapper);
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
	traverse(callback: BlobDataCallback) {
		// - 1 - we first go through the nodes and their assigned blobs
		// - 2 - and then we go through the global blobs
		// and sort the url to have the order being predictable
		const _forEachBlob = (urls: string[], isGlobal: boolean) => {
			this._blobWrappersByUrl.forEach((blobWrapper, url) => {
				const isWrapperGlobal = blobWrapper.referringNodeIds.size == 0;
				if (isWrapperGlobal == isGlobal) {
					urls.push(url);
				}
			});
		};

		const urls: string[] = [];
		_forEachBlob(urls, true);
		_forEachBlob(urls, false);

		urls.sort();
		for (let url of urls) {
			const blobWrapper = this._blobWrappersByUrl.get(url);
			if (blobWrapper) {
				const blobData: BlobData = {
					url,
					blobWrapper,
				};
				callback(blobData);
			}
		}
	}
	private _createBlobUrl(blob: Blob) {
		return createObjectURL(blob);
	}
	assetsManifestWithBlobsMap() {
		const manifest: PolyDictionary<string> = {};
		const blobsMap: Map<string, Blob> = new Map();
		const blobs: Blob[] = [];
		const fullUrls: string[] = [];
		this.traverse((blobData) => {
			blobs.push(blobData.blobWrapper.blob);
			const fullUrl = blobData.url;
			fullUrls.push(fullUrl);
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
		};
	}
}
