import {Poly} from '../Poly';

export interface BlobUrlData {
	originalUrl: string;
	blobUrl: string;
}
export interface FetchBlobUrlOptions {
	paramUrl: string;
	resolvedUrl: string;
}

export class BlobsController {
	private _blobUrlsByUrl: Map<string, string> = new Map();
	private _blobDatasByUrl: Map<string, Blob> = new Map();
	registerBlobUrl(data: BlobUrlData) {
		if (!Poly.playerMode()) {
			return;
		}
		this._blobUrlsByUrl.set(data.originalUrl, data.blobUrl);
	}
	blobUrl(originalUrl: string) {
		return this._blobUrlsByUrl.get(originalUrl);
	}

	async fetchBlob(options: FetchBlobUrlOptions) {
		if (Poly.playerMode()) {
			return;
		}
		const response = await fetch(options.resolvedUrl);
		const blob = await response.blob();
		this._blobDatasByUrl.set(options.paramUrl, blob);
	}
	forEachBlob(callback: (blob: Blob, paramUrl: string) => void) {
		return this._blobDatasByUrl.forEach(callback);
	}
}
