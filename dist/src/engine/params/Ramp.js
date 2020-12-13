import lodash_sortBy from "lodash/sortBy";
import {RGBFormat} from "three/src/constants";
import {DataTexture as DataTexture2} from "three/src/textures/DataTexture";
import {CubicInterpolant as CubicInterpolant2} from "three/src/math/interpolants/CubicInterpolant";
import {TypedParam} from "./_Base";
import {RampValue as RampValue2, RampPoint, RampInterpolation} from "./ramp/RampValue";
import {ParamType as ParamType2} from "../poly/ParamType";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 1;
const TEXTURE_SIZE = TEXTURE_WIDTH * TEXTURE_HEIGHT;
const RampParam2 = class extends TypedParam {
  constructor() {
    super(...arguments);
    this._texture_data = new Uint8Array(3 * TEXTURE_SIZE);
    this._ramp_texture = new DataTexture2(this._texture_data, TEXTURE_WIDTH, TEXTURE_HEIGHT, RGBFormat);
  }
  static type() {
    return ParamType2.RAMP;
  }
  get default_value_serialized() {
    if (this.default_value instanceof RampValue2) {
      return this.default_value.to_json();
    } else {
      return this.default_value;
    }
  }
  _clone_raw_input(raw_input) {
    if (raw_input instanceof RampValue2) {
      return raw_input.clone();
    } else {
      return RampValue2.from_json(raw_input).to_json();
    }
  }
  get raw_input_serialized() {
    if (this._raw_input instanceof RampValue2) {
      return this._raw_input.to_json();
    } else {
      return RampValue2.from_json(this._raw_input).to_json();
    }
  }
  get value_serialized() {
    return this.value.to_json();
  }
  _copy_value(param) {
    this.set(param.value_serialized);
  }
  static are_raw_input_equal(raw_input1, raw_input2) {
    if (raw_input1 instanceof RampValue2) {
      if (raw_input2 instanceof RampValue2) {
        return raw_input1.is_equal(raw_input2);
      } else {
        return raw_input1.is_equal_json(raw_input2);
      }
    } else {
      if (raw_input2 instanceof RampValue2) {
        return raw_input2.is_equal_json(raw_input1);
      } else {
        return RampValue2.are_json_equal(raw_input1, raw_input2);
      }
    }
  }
  static are_values_equal(val1, val2) {
    return val1.is_equal(val2);
  }
  get is_default() {
    if (this.default_value instanceof RampValue2) {
      return this.value.is_equal(this.default_value);
    } else {
      return this.value.is_equal_json(this.default_value);
    }
  }
  process_raw_input() {
    if (this._raw_input instanceof RampValue2) {
      if (!this._value) {
        this._value = this._raw_input;
      } else {
        this._value.copy(this._raw_input);
      }
    } else {
      if (!this._value) {
        this._value = RampValue2.from_json(this._raw_input);
      } else {
        this._value.from_json(this._raw_input);
      }
    }
    this._reset_ramp_interpolant();
    this._update_ramp_texture();
    this.options.execute_callback();
    this.emit_controller.emit(ParamEvent2.VALUE_UPDATED);
    this.set_successors_dirty(this);
  }
  has_expression() {
    return false;
  }
  _reset_ramp_interpolant() {
    this._ramp_interpolant = void 0;
  }
  ramp_texture() {
    return this._ramp_texture;
  }
  _update_ramp_texture() {
    this._update_ramp_texture_data();
    this.ramp_texture().needsUpdate = true;
  }
  _update_ramp_texture_data() {
    let stride = 0;
    let position = 0;
    let value = 0;
    for (var i = 0; i < TEXTURE_SIZE; i++) {
      stride = i * 3;
      position = i / TEXTURE_WIDTH;
      value = this.value_at_position(position);
      this._texture_data[stride] = value * 255;
    }
  }
  static create_interpolant(positions, values) {
    const values_count = 1;
    const interpolated_values = new Float32Array(values_count);
    return new CubicInterpolant2(positions, values, values_count, interpolated_values);
  }
  interpolant() {
    return this._ramp_interpolant = this._ramp_interpolant || this._create_interpolant();
  }
  _create_interpolant() {
    const points = this.value.points;
    const sorted_points = lodash_sortBy(points, (point) => point.position);
    const positions = new Float32Array(sorted_points.length);
    const values = new Float32Array(sorted_points.length);
    let i = 0;
    for (let sorted_point of sorted_points) {
      positions[i] = sorted_point.position;
      values[i] = sorted_point.value;
      i++;
    }
    return RampParam2.create_interpolant(positions, values);
  }
  value_at_position(position) {
    return this.interpolant().evaluate(position)[0];
  }
};
export let RampParam = RampParam2;
RampParam.DEFAULT_VALUE = new RampValue2(RampInterpolation.LINEAR, [new RampPoint(0, 0), new RampPoint(1, 1)]);
RampParam.DEFAULT_VALUE_JSON = RampParam2.DEFAULT_VALUE.to_json();
