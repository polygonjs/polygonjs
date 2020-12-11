import {ParamType as ParamType2} from "../../../../poly/ParamType";
import {NodeContext as NodeContext2} from "../../../../poly/NodeContext";
export class ParamConfig {
  constructor(_type, _name, _default_value) {
    this._type = _type;
    this._name = _name;
    this._default_value = _default_value;
  }
  static from_param(param) {
    return new ParamConfig(param.type, param.name, param.default_value);
  }
  get type() {
    return this._type;
  }
  get name() {
    return this._name;
  }
  get default_value() {
    return this._default_value;
  }
  get param_options() {
    const callback_bound = this._callback.bind(this);
    switch (this._type) {
      case ParamType2.OPERATOR_PATH:
        return {callback: callback_bound, node_selection: {context: NodeContext2.COP}};
      default:
        return {callback: callback_bound};
    }
  }
  _callback(node, param) {
  }
}
