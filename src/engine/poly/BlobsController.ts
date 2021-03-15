export interface BlobUrlData {
	originalUrl: string;
	blobUrl: string;
}
export class BlobsController {
	private _blobsByUrl: Map<string, string> = new Map();
	registerBlobUrl(data: BlobUrlData) {
		this._blobsByUrl.set(data.originalUrl, data.blobUrl);
	}
	blobUrl(originalUrl: string) {
		return this._blobsByUrl.get(originalUrl);
	}
}
