export class CoreFeaturesController {
	static urlParam(paramName: string) {
		return this._urlParams.get(paramName);
	}
	static noAssemblers(): boolean {
		return this.urlParam('noassemblers') == '1';
	}
	protected static _urlParams = new URLSearchParams(window.location.search);
}
