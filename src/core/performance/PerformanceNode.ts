import {BaseNodeType} from '../../engine/nodes/_Base';

export interface PerformancePrintObject {
	fullPath: string;
	cooks_count: number;
	total_time: number;
	total_cook_time: number;
	cook_time_per_iteration: number;
	// cook_time_total_with_inputs: number;
	// cook_time_total_with_inputs_per_iteration: number;
	inputs_time_per_iteration: number;
	params_time_per_iteration: number;
}

import {NodePerformanceData} from '../../engine/nodes/utils/cook/PerformanceController';
export class PerformanceNode {
	_cooks_count: number = 0;
	_total_cook_time: number = 0;
	_total_inputs_time: number = 0;
	_total_params_time: number = 0;
	constructor(private _node: BaseNodeType) {}

	update_cook_data(performance_data: NodePerformanceData): void {
		this._cooks_count += 1;
		this._total_cook_time += performance_data.cook_time;
		this._total_inputs_time += performance_data.inputs_time;
		this._total_params_time += performance_data.params_time;
	}
	total_time(): number {
		return this._total_cook_time + this._total_inputs_time + this._total_params_time;
	}
	total_cook_time(): number {
		return this._total_cook_time;
	}
	cook_time_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._total_cook_time / this._cooks_count;
		} else {
			return 0;
		}
	}
	total_inputs_time(): number {
		return this._total_inputs_time;
	}
	inputs_time_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._total_inputs_time / this._cooks_count;
		} else {
			return 0;
		}
	}

	total_params_time2(): number {
		return this._total_params_time;
	}
	params_time_per_iteration2(): number {
		if (this._cooks_count > 0) {
			return this._total_params_time / this._cooks_count;
		} else {
			return 0;
		}
	}

	cooks_count(): number {
		return this._cooks_count;
	}

	print_object(): PerformancePrintObject {
		return {
			fullPath: this._node.fullPath(),
			cooks_count: this.cooks_count(),
			total_time: this.total_time(),
			total_cook_time: this.total_cook_time(),
			cook_time_per_iteration: this.cook_time_per_iteration(),
			// cook_time_total_with_inputs: this.cook_time_total_with_inputs,
			// cook_time_total_with_inputs_per_iteration: this.cook_time_total_with_inputs_per_iteration,
			inputs_time_per_iteration: this.inputs_time_per_iteration(),
			params_time_per_iteration: this.params_time_per_iteration2(),
		};
	}
}
