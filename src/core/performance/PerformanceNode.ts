import {BaseNodeType} from '../../engine/nodes/_Base';

export class PerformanceNode {
	_cooks_count: number = 0;
	_cook_time_total: number = 0;
	_cook_time_total_with_inputs: number = 0;
	_cook_time_total_params: number = 0;
	constructor(private _node: BaseNodeType) {}

	update_cook_data(): void {
		this._cooks_count += 1;
		this._cook_time_total += this._node.cook_controller.cook_time;
		this._cook_time_total_with_inputs += this._node.cook_controller.cook_time_with_inputs;
		this._cook_time_total_params += this._node.cook_controller.cook_time_params;
	}

	get cook_time_total(): number {
		return this._cook_time_total;
	}
	get cook_time_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._cook_time_total / this._cooks_count;
		} else {
			return 0;
		}
	}
	get cook_time_total_with_inputs(): number {
		return this._cook_time_total_with_inputs;
	}
	get cook_time_total_with_inputs_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._cook_time_total_with_inputs / this._cooks_count;
		} else {
			return 0;
		}
	}

	get cook_time_total_params(): number {
		return this._cook_time_total_params;
	}
	get cook_time_total_params_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._cook_time_total_params / this._cooks_count;
		} else {
			return 0;
		}
	}

	get cooks_count(): number {
		return this._cooks_count;
	}

	print_object() {
		return {
			full_path: this._node.full_path(),
			cooks_count: this.cooks_count,
			cook_time_total: this.cook_time_total,
			cook_time_per_iteration: this.cook_time_per_iteration,
			cook_time_total_with_inputs: this.cook_time_total_with_inputs,
			cook_time_total_with_inputs_per_iteration: this.cook_time_total_with_inputs_per_iteration,
			cook_time_total_params: this.cook_time_total_params,
			cook_time_total_params_per_iteration: this.cook_time_total_params_per_iteration,
		};
	}
}
