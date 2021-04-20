import {PolyDictionary} from '../../types/GlobalTypes';

export class AssetUrlsController {
	private _map: PolyDictionary<string> | undefined;

	setMap(map: PolyDictionary<string>) {
		this._map = map;
	}

	remapedUrl(url: string) {
		if (!this._map) {
			return;
		}
		const elements = url.split('?');
		const preQuery = elements[0];
		const query = elements[1];
		const remapedUrl = this._map[preQuery];
		if (remapedUrl) {
			if (query) {
				return `${remapedUrl}?${query}`;
			} else {
				return remapedUrl;
			}
		}
	}
}
