import {Poly} from '../Poly';

export interface BlobUrlData {
	storedUrl: string;
	blobUrl: string;
}
export interface FetchBlobUrlOptions {
	storedUrl: string;
	fullUrl: string;
}

export class BlobsController {
	private _blobUrlsByUrl: Map<string, string> = new Map();
	private _blobsByUrl: Map<string, Blob> = new Map();
	registerBlobUrl(data: BlobUrlData) {
		if (!Poly.playerMode()) {
			return;
		}
		this._blobUrlsByUrl.set(data.storedUrl, data.blobUrl);
	}
	blobUrl(storedUrl: string) {
		return this._blobUrlsByUrl.get(storedUrl);
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
			this._blobUrlsByUrl.set(options.storedUrl, this.createBlobUrl(blob));
			return;
		} catch (err) {
			return;
		}
	}
	forEachBlob(callback: (blob: Blob, storedUrl: string) => void) {
		return this._blobsByUrl.forEach(callback);
	}
	createBlobUrl(blob: Blob) {
		const urlCreator = window.URL || window.webkitURL;
		return urlCreator.createObjectURL(blob);
	}
}
