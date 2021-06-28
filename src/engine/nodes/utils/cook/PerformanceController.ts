import {Poly} from '../../../Poly';
import {NodeCookController} from '../CookController';

export interface NodePerformanceData {
	inputsTime: number;
	paramsTime: number;
	cookTime: number;
}

const performance = Poly.performance.performanceManager();
export class NodeCookPerformanceformanceController {
	private _inputs_start: number = 0;
	private _params_start: number = 0;
	private _cook_start: number = 0;
	private _cooksCount: number = 0;
	private _data: NodePerformanceData = {
		inputsTime: 0,
		paramsTime: 0,
		cookTime: 0,
	};

	constructor(private cookController: NodeCookController<any>) {}

	cooksCount() {
		return this._cooksCount;
	}
	data2() {
		return this._data;
	}

	active(): boolean {
		return this.cookController.performanceRecordStarted();
	}

	//
	// INPUTS
	//
	recordInputsStart() {
		if (this.active()) {
			this._inputs_start = performance.now();
		}
	}
	recordInputsEnd() {
		if (this.active()) {
			this._data.inputsTime = performance.now() - this._inputs_start;
		}
	}
	//
	// PARAMS
	//
	recordParamsStart() {
		if (this.active()) {
			this._params_start = performance.now();
		}
	}
	recordParamsEnd() {
		if (this.active()) {
			this._data.paramsTime = performance.now() - this._params_start;
		}
	}
	//
	// COOK
	//
	recordCookStart() {
		if (this.active()) {
			this._cook_start = performance.now();
		}
	}
	recordCookEnd() {
		if (this.active()) {
			this._data.cookTime = performance.now() - this._cook_start;
			this._cooksCount += 1;
		}
	}
}
