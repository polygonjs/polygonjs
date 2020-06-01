import mapboxgl from 'mapbox-gl';
import {IntegrationData} from '../../engine/nodes/_Base';
export class CoreMapboxClient {
	// static JS_URL =
	// "https://api.tiles.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.js";
	static CSS_URL = 'https://api.mapbox.com/mapbox-gl-js/v1.9.1/mapbox-gl.css';
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
		}
	}

	private static _read_token_from_html(): string | undefined {
		const integrations_element = document.getElementById('integrations-data');
		if (!integrations_element) {
			console.error('mapbox element not found');
		}
		return integrations_element?.dataset['mapboxToken'];
	}
	static integration_data(): IntegrationData | void {
		const token = this._read_token_from_html();
		if (token) {
			return {
				name: 'mapbox',
				data: {token},
			};
		}
	}
}
