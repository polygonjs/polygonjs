import lodash_isNumber from "lodash/isNumber";
import lodash_isBoolean from "lodash/isBoolean";
import lodash_isString from "lodash/isString";
import {TypedNumericParam} from "./_Numeric";
import {ParamType as ParamType2} from "../poly/ParamType";
import {CoreString} from "../../core/String";
export class BooleanParam extends TypedNumericParam {
  static type() {
    return ParamType2.BOOLEAN;
  }
  get default_value_serialized() {
    if (lodash_isString(this.default_value)) {
      return this.default_value;
    } else {
      return this.convert(this.default_value) || false;
    }
  }
  get raw_input_serialized() {
    return this._raw_input;
  }
  get value_serialized() {
    return this.value;
  }
  _copy_value(param) {
    this.set(param.value);
  }
  static are_raw_input_equal(raw_input1, raw_input2) {
    return raw_input1 == raw_input2;
  }
  static are_values_equal(val1, val2) {
    return val1 == val2;
  }
  convert(raw_val) {
    if (lodash_isBoolean(raw_val)) {
      return raw_val;
    } else {
      if (lodash_isNumber(raw_val)) {
        return raw_val >= 1;
      } else {
        if (lodash_isString(raw_val)) {
          if (CoreString.is_boolean(raw_val)) {
            return CoreString.to_boolean(raw_val);
          } else {
            if (CoreString.is_number(raw_val)) {
              const parsed = parseFloat(raw_val);
              return parsed >= 1;
            }
          }
        }
      }
    }
    return null;
  }
}
