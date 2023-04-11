import {ref} from '../../../core/reactivity/CoreReactivity';
import {PolyScene} from '../PolyScene';

// enum ThresholdState {
// 	ABOVE = 1,
// 	UNDER = -1,
// }
// interface ThresholdContainer {
// 	threshold: number;
// 	state: ThresholdState;
// }

export class ScenePerformanceMonitor {
	private _performanceRef = ref(1);
	// private _thresholdContainers: ThresholdContainer[] = [];
	constructor(protected scene: PolyScene) {}
	// reset() {
	// 	this._thresholdContainers.length = 0;
	// }
	// addThreshold(threshold: number) {
	// 	// check first that a similar threshold exists
	// 	for (let container of this._thresholdContainers) {
	// 		if (container.threshold == threshold) {
	// 			// no need to add it
	// 			return;
	// 		}
	// 	}

	// 	// add if none similar found
	// 	this._thresholdContainers.push({
	// 		threshold,
	// 		state: ThresholdState.ABOVE,
	// 	});
	// }
	ref() {
		return this._performanceRef;
	}
	onPerformanceChange(perf: number) {
		this._performanceRef.value = perf;

		// let updateRequired = false;
		// for (let container of this._thresholdContainers) {
		// 	if (perf < container.threshold && container.state == ThresholdState.ABOVE) {
		// 		container.state = ThresholdState.UNDER;
		// 		updateRequired = true;
		// 		break;
		// 	}
		// 	if (perf > container.threshold && container.state == ThresholdState.UNDER) {
		// 		container.state = ThresholdState.ABOVE;
		// 		updateRequired = true;
		// 		break;
		// 	}
		// }

		// if (!updateRequired) {
		// 	return;
		// }
		// this.scene.actorsManager.runOnEventPerformanceChange();
	}
	// performance() {
	// 	return this._performance;
	// }
}
