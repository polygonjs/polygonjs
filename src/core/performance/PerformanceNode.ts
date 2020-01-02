export class PerformanceNode {
	_node: any
	_cooks_count: number = 0
	_cook_time_total: number = 0
	_cook_time_total_with_inputs: number = 0
	_cook_time_total_params: number = 0
	constructor(_node: any) {
		this._node = _node
		this._cooks_count = 0
		this._cook_time_total = 0
		this._cook_time_total_with_inputs = 0
		this._cook_time_total_params = 0
	}

	update_cook_data(): void {
		this._cooks_count += 1
		this._cook_time_total += this._node.cook_time()
		this._cook_time_total_with_inputs += this._node.cook_time_with_inputs()
		return (this._cook_time_total_params += this._node.cook_time_params())
	}

	cook_time_total(): number {
		return this._cook_time_total
	}
	cook_time_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._cook_time_total / this._cooks_count
		} else {
			return 0
		}
	}
	cook_time_total_with_inputs(): number {
		return this._cook_time_total_with_inputs
	}
	cook_time_total_with_inputs_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._cook_time_total_with_inputs / this._cooks_count
		} else {
			return 0
		}
	}

	cook_time_total_params(): number {
		return this._cook_time_total_params
	}
	cook_time_total_params_per_iteration(): number {
		if (this._cooks_count > 0) {
			return this._cook_time_total_params / this._cooks_count
		} else {
			return 0
		}
	}

	cooks_count(): number {
		return this._cooks_count
	}

	print_object() {
		return {
			full_path: this._node.full_path(),
			cooks_count: this.cooks_count(),
			cook_time_total: this.cook_time_total(),
			cook_time_per_iteration: this.cook_time_per_iteration(),
			cook_time_total_with_inputs: this.cook_time_total_with_inputs(),
			cook_time_total_with_inputs_per_iteration: this.cook_time_total_with_inputs_per_iteration(),
			cook_time_total_params: this.cook_time_total_params(),
			cook_time_total_params_per_iteration: this.cook_time_total_params_per_iteration(),
		}
	}
}
