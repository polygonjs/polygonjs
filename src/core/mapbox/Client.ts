import mapboxgl from "mapbox-gl";

export class CoreMapboxClient {
	// static JS_URL =
	// "https://api.tiles.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.js";
	static CSS_URL = "https://api.mapbox.com/mapbox-gl-js/v1.9.1/mapbox-gl.css";
	static _token: string;

	static ensure_token_is_set() {
		// await CoreScriptLoader.load(this.JS_URL); // loading this will define mapboxgl globally
		if (!mapboxgl.accessToken) {
			this.fetch_token();
		}
	}
	static token() {
		if (!this._token) {
			this.fetch_token();
		}
		return this._token;
	}
	// used in tests
	static set_token(token: string) {
		this._token = token;
		mapboxgl.accessToken = this._token;
	}

	static fetch_token() {
		if (this._token) {
			return this._token;
		} else {
			let token: string | undefined = this._read_token_from_html();
			if (token) {
				this.set_token(token);
				return;
			}
			// token = await this._fetch_token_from_api(scene);
			// if (token) {
			// 	this.set_token(token);
			// 	return;
			// }
		}
	}

	private static _read_token_from_html(): string | undefined {
		const element = document.getElementById("mapbox-data");
		if (!element) {
			console.error("mapbox element not found");
		}
		return element?.dataset["token"];
	}
	// private static async _fetch_token_from_api(scene: PolyScene) {
	// 	const scene_uuid = scene.uuid;

	// 	let url;
	// 	if (scene_uuid) {
	// 		url = `/api/scenes/${scene_uuid}/mapbox`;
	// 	} else {
	// 		// in case the scene has not been saved yet
	// 		url = `/api/account/mapbox_token`;
	// 	}

	// 	const response = await fetch(url);
	// 	const token = (await response.json()).token;
	// 	return token;
	// }
}
