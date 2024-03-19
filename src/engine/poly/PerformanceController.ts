interface PerformanceManager {
	now: () => number;
}

export class PolyPerformanceformanceController {
	private _performanceManager: PerformanceManager | undefined;
	setPerformanceManager(p: PerformanceManager) {
		this._performanceManager = p;
	}
	performanceManager(): PerformanceManager {
		return this._performanceManager || globalThis.performance;
	}
}
