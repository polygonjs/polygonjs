export class CoreFeaturesController {
	static urlParam(param_name: string) {
		return this._urlParams.get(param_name);
	}
	protected static _urlParams = new URLSearchParams(window.location.search);
}
