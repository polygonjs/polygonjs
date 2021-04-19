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
		return this._map[url];
	}
}
