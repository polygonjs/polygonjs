import {Poly} from '../../../Poly';
import {NodeCookController} from '../CookController';

export interface NodePerformanceData {
	inputsTime: number;
	paramsTime: number;
	cookTime: number;
}

const performance = Poly.performance.performanceManager();
export class NodeCookPerformanceformanceController {
	private _inputsStart: number = 0;
	private _inputsTime: number = 0;
	private _paramsStart: number = 0;
	private _paramsTime: number = 0;
	private _cookStart: number = 0;
	private _cookTime: number = 0;
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
	data() {
		this._data.inputsTime = this._inputsTime;
		this._data.paramsTime = this._paramsTime;
		this._data.cookTime = this._cookTime;
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
			this._inputsStart = performance.now();
		}
	}
	recordInputsEnd() {
		if (this.active()) {
			this._inputsTime = performance.now() - this._inputsStart;
		}
	}
	//
	// PARAMS
	//
	recordParamsStart() {
		if (this.active()) {
			this._paramsStart = performance.now();
		}
	}
	recordParamsEnd() {
		if (this.active()) {
			this._paramsTime = performance.now() - this._paramsStart;
		}
	}
	//
	// COOK
	//
	recordCookStart() {
		if (this.active()) {
			this._cookStart = performance.now();
		}
	}
	recordCookEnd() {
		if (this.active()) {
			this._cookTime = performance.now() - this._cookStart;
			this._cooksCount += 1;
		}
	}
}
