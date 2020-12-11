export class NodeCookPerformanceformanceController {
  constructor(cook_controller) {
    this.cook_controller = cook_controller;
    this._inputs_start = 0;
    this._params_start = 0;
    this._cook_start = 0;
    this._cooks_count = 0;
    this._data = {
      inputs_time: 0,
      params_time: 0,
      cook_time: 0
    };
  }
  get cooks_count() {
    return this._cooks_count;
  }
  get data() {
    return this._data;
  }
  get active() {
    return this.cook_controller.performance_record_started;
  }
  record_inputs_start() {
    if (this.active) {
      this._inputs_start = performance.now();
    }
  }
  record_inputs_end() {
    if (this.active) {
      this._data.inputs_time = performance.now() - this._inputs_start;
    }
  }
  record_params_start() {
    if (this.active) {
      this._params_start = performance.now();
    }
  }
  record_params_end() {
    if (this.active) {
      this._data.params_time = performance.now() - this._params_start;
    }
  }
  record_cook_start() {
    if (this.active) {
      this._cook_start = performance.now();
    }
  }
  record_cook_end() {
    if (this.active) {
      this._data.cook_time = performance.now() - this._cook_start;
      this._cooks_count += 1;
    }
  }
}
