import {NodeCookController} from '../CookController';

export interface NodePerformanceData {
	inputs_time: number;
	params_time: number;
	cook_time: number;
}

export class NodeCookPerformanceformanceController {
	private _inputs_start: number = 0;
	private _params_start: number = 0;
	private _cook_start: number = 0;
	private _cooks_count: number = 0;
	private _data: NodePerformanceData = {
		inputs_time: 0,
		params_time: 0,
		cook_time: 0,
	};

	constructor(private cookController: NodeCookController<any>) {}

	get cooks_count() {
		return this._cooks_count;
	}
	get data() {
		return this._data;
	}

	active() {
		return this.cookController.performance_record_started;
	}

	//
	// INPUTS
	//
	record_inputs_start() {
		if (this.active()) {
			this._inputs_start = performance.now();
		}
	}
	record_inputs_end() {
		if (this.active()) {
			this._data.inputs_time = performance.now() - this._inputs_start;
		}
	}
	//
	// PARAMS
	//
	record_params_start() {
		if (this.active()) {
			this._params_start = performance.now();
		}
	}
	record_params_end() {
		if (this.active()) {
			this._data.params_time = performance.now() - this._params_start;
		}
	}
	//
	// COOK
	//
	record_cook_start() {
		if (this.active()) {
			this._cook_start = performance.now();
		}
	}
	record_cook_end() {
		if (this.active()) {
			this._data.cook_time = performance.now() - this._cook_start;
			this._cooks_count += 1;
		}
	}
}
