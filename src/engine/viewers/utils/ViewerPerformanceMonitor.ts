import {DESIRED_FPS} from '../../scene/utils/TimeController';
import {BaseViewerType} from '../_Base';

function _round(perf: number) {
	return Math.round(perf * 10);
}

export class ViewerPerformanceMonitor {
	constructor(protected viewer: BaseViewerType) {}

	protected _accumulatedDelta = 0;
	protected _framesCount = 0;
	protected _lastRoundedPerf = _round(1);
	measurePerformance(delta: number) {
		this._accumulatedDelta += delta;
		if (this._accumulatedDelta >= 1) {
			const perf = this._framesCount / DESIRED_FPS;
			const roundedPerf = _round(perf);
			if (roundedPerf != this._lastRoundedPerf) {
				this._lastRoundedPerf = roundedPerf;
				this.viewer.scene().perfMonitor.onPerformanceChange(perf);
			}
			this._framesCount = 0;
			this._accumulatedDelta = 0;
		}
		this._framesCount++;
	}
}
