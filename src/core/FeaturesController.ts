export class CoreFeaturesController {
	static urlParam(paramName: string) {
		return this._urlParams.get(paramName);
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
	protected static _urlParams = new URLSearchParams(window.location.search);
}
