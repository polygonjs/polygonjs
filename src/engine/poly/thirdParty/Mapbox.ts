export const MAPBOX_TOKEN_MISSING_ERROR_MESSAGE = `Set your mapbox token with "poly.thirdParty.mapbox().setToken('<YOUR TOKEN>')" in the PolyConfig.ts file, then reload the page`;

type GetTokenFunc = () => Promise<string | undefined>;

export class PolyThirdPartyMapboxController {
	private _token: string | undefined;
	private _getTokenFunc: GetTokenFunc | undefined;
	setToken(token: string) {
		this._token = token;
	}
	setGetTokenFunction(tokenFunc: GetTokenFunc) {
		this._getTokenFunc = tokenFunc;
	}
	async token() {
		if (this._token) {
			return this._token;
		}
		if (this._getTokenFunc) {
			return await this._getTokenFunc();
		}
	}
}
