import {TypedMultipleParam} from "./_Multiple";
import lodash_isArray from "lodash/isArray";
import {Color as Color2} from "three/src/math/Color";
import {ParamType as ParamType2} from "../poly/ParamType";
import {ColorConversion} from "../../core/Color";
import {TypeAssert} from "../poly/Assert";
const COMPONENT_NAMES_COLOR = ["r", "g", "b"];
export class ColorParam extends TypedMultipleParam {
  constructor() {
    super(...arguments);
    this._value = new Color2();
    this._value_pre_conversion = new Color2();
    this._value_serialized_dirty = false;
    this._value_serialized = [0, 0, 0];
    this._value_pre_conversion_serialized = [0, 0, 0];
    this._copied_value = [0, 0, 0];
  }
  static type() {
    return ParamType2.COLOR;
  }
  get component_names() {
    return COMPONENT_NAMES_COLOR;
  }
  get default_value_serialized() {
    if (lodash_isArray(this.default_value)) {
      return this.default_value;
    } else {
      return this.default_value.toArray();
    }
  }
  get value_serialized() {
    this._update_value_serialized_if_required();
    return this._value_serialized;
  }
  get value_pre_conversion_serialized() {
    this._update_value_serialized_if_required();
    return this._value_pre_conversion_serialized;
  }
  _copy_value(param) {
    param.value.toArray(this._copied_value);
    this.set(this._copied_value);
  }
  _clone_raw_input(raw_input) {
    if (raw_input instanceof Color2) {
      return raw_input.clone();
    } else {
      const new_array = [raw_input[0], raw_input[1], raw_input[2]];
      return new_array;
    }
  }
  static are_raw_input_equal(raw_input1, raw_input2) {
    if (raw_input1 instanceof Color2) {
      if (raw_input2 instanceof Color2) {
        return raw_input1.equals(raw_input2);
      } else {
        return raw_input1.r == raw_input2[0] && raw_input1.g == raw_input2[1] && raw_input1.b == raw_input2[2];
      }
    } else {
      if (raw_input2 instanceof Color2) {
        return raw_input1[0] == raw_input2.r && raw_input1[1] == raw_input2.g && raw_input1[2] == raw_input2.b;
      } else {
        return raw_input1[0] == raw_input2[0] && raw_input1[1] == raw_input2[1] && raw_input1[2] == raw_input2[2];
      }
    }
  }
  static are_values_equal(val1, val2) {
    return val1.equals(val2);
  }
  init_components() {
    super.init_components();
    this.r = this.components[0];
    this.g = this.components[1];
    this.b = this.components[2];
    this._value_serialized_dirty = true;
  }
  _update_value_serialized_if_required() {
    if (!this._value_serialized_dirty) {
      return;
    }
    this._value_serialized[0] = this._value.r;
    this._value_serialized[1] = this._value.g;
    this._value_serialized[2] = this._value.b;
    this._value_pre_conversion_serialized[0] = this._value_pre_conversion.r;
    this._value_pre_conversion_serialized[1] = this._value_pre_conversion.g;
    this._value_pre_conversion_serialized[2] = this._value_pre_conversion.b;
  }
  get value_pre_conversion() {
    return this._value_pre_conversion;
  }
  set_value_from_components() {
    this._value_pre_conversion.r = this.r.value;
    this._value_pre_conversion.g = this.g.value;
    this._value_pre_conversion.b = this.b.value;
    this._value.copy(this._value_pre_conversion);
    const conversion = this.options.color_conversion();
    if (conversion != null && conversion != ColorConversion.NONE) {
      switch (conversion) {
        case ColorConversion.GAMMA_TO_LINEAR: {
          this._value.convertGammaToLinear();
          return;
        }
        case ColorConversion.LINEAR_TO_GAMMA: {
          this._value.convertLinearToGamma();
          return;
        }
        case ColorConversion.SRGB_TO_LINEAR: {
          this._value.convertSRGBToLinear();
          return;
        }
        case ColorConversion.LINEAR_TO_SRGB: {
          this._value.convertLinearToSRGB();
          return;
        }
      }
      TypeAssert.unreachable(conversion);
    }
    this._value_serialized_dirty = true;
  }
}
