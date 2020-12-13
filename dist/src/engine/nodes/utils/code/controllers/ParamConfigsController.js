export class ParamConfigsController {
  constructor() {
    this._param_configs = [];
  }
  reset() {
    this._param_configs = [];
  }
  push(param_config) {
    this._param_configs.push(param_config);
  }
  get list() {
    return this._param_configs;
  }
}
