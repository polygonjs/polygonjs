import {BaseNodeType} from '../nodes/_Base';
import {PolyEngine} from '../Poly';
import {CoreGraphNodeId} from '../../core/graph/CoreGraph';
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
	constructor(private poly: PolyEngine) {}

	recording() {
		return !this.poly.playerMode();
	}

	clear() {}
	clearBlobsForNode(node: BaseNodeType) {}

	async setVirtualFile(file: File, uniqueId: string) {}

	async fetchBlobGlobal(url: string): Promise<FetchBlobResponse | void> {}

	traverse(callback: BlobDataCallback) {}
}
