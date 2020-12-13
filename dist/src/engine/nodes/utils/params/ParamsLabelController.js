import {ParamType as ParamType2} from "../../../poly/ParamType";
export class ParamsLabelController {
  constructor() {
  }
  params() {
    return this._params;
  }
  callback() {
    return this._callback;
  }
  init(params, callback) {
    this._params = params;
    if (callback) {
      this._callback = callback;
    } else {
      const param = this._params[0];
      switch (param.type) {
        case ParamType2.STRING:
          return this._handle_string_param(param);
        case ParamType2.OPERATOR_PATH:
          return this._handle_operator_path_param(param);
        case ParamType2.FLOAT:
          return this._handle_number_param(param);
        case ParamType2.INTEGER:
          return this._handle_number_param(param);
      }
    }
  }
  _handle_string_param(param) {
    this._callback = () => {
      return param.value;
    };
  }
  _handle_operator_path_param(param) {
    this._callback = () => {
      return param.value;
    };
  }
  _handle_number_param(param) {
    this._callback = () => {
      return `${param.value}`;
    };
  }
}
