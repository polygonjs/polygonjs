export class PerformanceNode {
  constructor(_node) {
    this._node = _node;
    this._cooks_count = 0;
    this._total_cook_time = 0;
    this._total_inputs_time = 0;
    this._total_params_time = 0;
  }
  update_cook_data(performance_data) {
    this._cooks_count += 1;
    this._total_cook_time += performance_data.cook_time;
    this._total_inputs_time += performance_data.inputs_time;
    this._total_params_time += performance_data.params_time;
  }
  get total_time() {
    return this._total_cook_time + this._total_inputs_time + this._total_params_time;
  }
  get total_cook_time() {
    return this._total_cook_time;
  }
  get cook_time_per_iteration() {
    if (this._cooks_count > 0) {
      return this._total_cook_time / this._cooks_count;
    } else {
      return 0;
    }
  }
  get total_inputs_time() {
    return this._total_inputs_time;
  }
  get inputs_time_per_iteration() {
    if (this._cooks_count > 0) {
      return this._total_inputs_time / this._cooks_count;
    } else {
      return 0;
    }
  }
  get total_params_time() {
    return this._total_params_time;
  }
  get params_time_per_iteration() {
    if (this._cooks_count > 0) {
      return this._total_params_time / this._cooks_count;
    } else {
      return 0;
    }
  }
  get cooks_count() {
    return this._cooks_count;
  }
  print_object() {
    return {
      full_path: this._node.full_path(),
      cooks_count: this.cooks_count,
      total_time: this.total_time,
      total_cook_time: this.total_cook_time,
      cook_time_per_iteration: this.cook_time_per_iteration,
      inputs_time_per_iteration: this.inputs_time_per_iteration,
      params_time_per_iteration: this.params_time_per_iteration
    };
  }
}
