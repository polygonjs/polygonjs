import lodash_isString from "lodash/isString";
import lodash_isNumber from "lodash/isNumber";
export class ParamJsonExporter {
  constructor(_param) {
    this._param = _param;
    this._complex_data = {};
  }
  get required() {
    const is_spare_and_not_component = this._param.options.is_spare && !this._param.parent_param;
    const value_changed = !this._param.is_default;
    return is_spare_and_not_component || value_changed || this._param.options.has_options_overridden;
  }
  data() {
    if (this._param.parent_param) {
      console.warn("no component should be saved");
      throw "no component should be saved";
    }
    if (this._require_data_complex()) {
      return this._data_complex();
    } else {
      return this._data_simple();
    }
  }
  _data_simple() {
    return this._param.raw_input_serialized;
  }
  _data_complex() {
    this._complex_data = {};
    if (this._param.options.is_spare && !this._param.parent_param) {
      this._complex_data["type"] = this._param.type;
      this._complex_data["default_value"] = this._param.default_value_serialized;
      this._complex_data["options"] = this._param.options.current;
    }
    if (!this._param.is_default) {
      this._complex_data["raw_input"] = this._param.raw_input_serialized;
    }
    if (this._param.options.has_options_overridden) {
      const overridden_options = {};
      const options_overridden = this._param.options.overridden_options;
      for (let option_name of Object.keys(options_overridden)) {
        const option_value = options_overridden[option_name];
        if (lodash_isString(option_value) || lodash_isNumber(option_value)) {
          overridden_options[option_name] = option_value;
        } else {
          overridden_options[option_name] = JSON.stringify(option_value);
        }
      }
      this._complex_data["overriden_options"] = overridden_options;
    }
    return this._complex_data;
  }
  _require_data_complex() {
    if (this._param.options.is_spare) {
      return true;
    }
    if (this._param.options.has_options_overridden) {
      return true;
    }
    return false;
  }
  add_main() {
  }
}
