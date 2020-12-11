import {TypedParam} from "./_Base";
import {ParamType as ParamType2} from "../poly/ParamType";
export class FolderParam extends TypedParam {
  static type() {
    return ParamType2.FOLDER;
  }
  get default_value_serialized() {
    return this.default_value;
  }
  get raw_input_serialized() {
    return this._raw_input;
  }
  get value_serialized() {
    return this.value;
  }
  _copy_value(param) {
  }
  static are_raw_input_equal(raw_input1, raw_input2) {
    return true;
  }
  static are_values_equal(val1, val2) {
    return true;
  }
}
