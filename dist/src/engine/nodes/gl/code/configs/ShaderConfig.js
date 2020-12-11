export class ShaderConfig {
  constructor(_name, _input_names, _dependencies) {
    this._name = _name;
    this._input_names = _input_names;
    this._dependencies = _dependencies;
  }
  name() {
    return this._name;
  }
  input_names() {
    return this._input_names;
  }
  dependencies() {
    return this._dependencies;
  }
}
