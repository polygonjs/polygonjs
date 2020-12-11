export class VariableConfig {
  constructor(_name, _options = {}) {
    this._name = _name;
    this._options = _options;
  }
  name() {
    return this._name;
  }
  default_from_attribute() {
    return this._options["default_from_attribute"] || false;
  }
  default() {
    return this._options["default"];
  }
  if_condition() {
    return this._options["if"];
  }
  prefix() {
    return this._options["prefix"] || "";
  }
  suffix() {
    return this._options["suffix"] || "";
  }
}
