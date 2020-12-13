import lodash_isBoolean from "lodash/isBoolean";
import lodash_isNumber from "lodash/isNumber";
import lodash_isString from "lodash/isString";
import lodash_isArray from "lodash/isArray";
import {Color as Color2} from "three/src/math/Color";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {TypedPathParamValue} from "../../Walker";
import {InputsController as InputsController2} from "./utils/InputsController";
export class BaseOperationContainer {
  constructor(operation, name, init_params) {
    this.operation = operation;
    this.name = name;
    this.params = {};
    this._apply_default_params();
    this._apply_init_params(init_params);
    this._init_cloned_states();
  }
  path_param_resolve_required() {
    return this._path_params != null;
  }
  resolve_path_params(node_start) {
    if (!this._path_params) {
      return;
    }
    for (let path_param of this._path_params) {
      path_param.resolve(node_start);
    }
  }
  _apply_default_params() {
    const default_params = this.operation.constructor.DEFAULT_PARAMS;
    const param_names = Object.keys(default_params);
    for (let param_name of param_names) {
      const param_data = default_params[param_name];
      const clone_param_data = this._convert_param_data(param_name, param_data);
      if (clone_param_data != void 0) {
        this.params[param_name] = clone_param_data;
      }
    }
  }
  _apply_init_params(init_params) {
    const param_names = Object.keys(init_params);
    for (let param_name of param_names) {
      const param_data = init_params[param_name];
      if (param_data.simple_data != null) {
        const simple_data = param_data.simple_data;
        const clone_param_data = this._convert_export_param_data(param_name, simple_data);
        if (clone_param_data != void 0) {
          this.params[param_name] = clone_param_data;
        }
      }
    }
  }
  _convert_param_data(param_name, param_data) {
    if (lodash_isNumber(param_data) || lodash_isBoolean(param_data) || lodash_isString(param_data)) {
      return param_data;
    }
    if (param_data instanceof TypedPathParamValue) {
      const cloned = param_data.clone();
      if (!this._path_params) {
        this._path_params = [];
      }
      this._path_params.push(cloned);
      return cloned;
    }
    if (param_data instanceof Color2 || param_data instanceof Vector22 || param_data instanceof Vector32 || param_data instanceof Vector42) {
      return param_data.clone();
    }
  }
  _convert_export_param_data(param_name, param_data) {
    const default_param = this.params[param_name];
    if (lodash_isBoolean(param_data)) {
      return param_data;
    }
    if (lodash_isNumber(param_data)) {
      if (lodash_isBoolean(default_param)) {
        return param_data >= 1 ? true : false;
      } else {
        return param_data;
      }
    }
    if (lodash_isString(param_data)) {
      if (default_param && default_param instanceof TypedPathParamValue) {
        return default_param.set_path(param_data);
      } else {
        return param_data;
      }
    }
    if (lodash_isArray(param_data)) {
      this.params[param_name].fromArray(param_data);
    }
  }
  set_input(index, input) {
    this._inputs = this._inputs || [];
    this._inputs[index] = input;
  }
  inputs_count() {
    if (this._inputs) {
      return this._inputs.length;
    } else {
      return 0;
    }
  }
  inputs_controller() {
    return this._inputs_controller = this._inputs_controller || new InputsController2(this);
  }
  _init_cloned_states() {
    const default_cloned_states = this.operation.constructor.INPUT_CLONED_STATE;
    this.inputs_controller().init_inputs_cloned_state(default_cloned_states);
  }
  input_clone_required(index) {
    if (!this._inputs_controller) {
      return true;
    }
    return this._inputs_controller.clone_required(index);
  }
  override_input_clone_state(state) {
    this.inputs_controller().override_cloned_state(state);
  }
  cook(input_contents) {
    return this.operation.cook(input_contents, this.params);
  }
}
