export class CoreFeaturesController {
	static urlParams() {
		// do not cache the url params, in case the url is changed via
		// window.history.replaceState('', '', window.location.pathname);
		return new URLSearchParams(window.location.search);
	}
	static urlParam(paramName: string) {
		return this.urlParams().get(paramName);
	}
	static noAssemblers(): boolean {
		return this.urlParam('noassemblers') == '1';
	}
	static debugLoadProgress(): boolean {
		return this.urlParam('debugLoadProgress') == '1';
	}
	static testBatchId(): number {
		const testBatchIdStr = this.urlParam('testBatchId');
		if (testBatchIdStr) {
			return parseInt(testBatchIdStr);
		}
		return -1;
	}
}
