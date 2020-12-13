import {CoreString} from "./String";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector4 as Vector42} from "three/src/math/Vector4";
import {Color as Color2} from "three/src/math/Color";
import lodash_isNumber from "lodash/isNumber";
import lodash_isBoolean from "lodash/isBoolean";
import lodash_isString from "lodash/isString";
import lodash_isArray from "lodash/isArray";
export class ThreeToGl {
  static any(value) {
    if (lodash_isString(value)) {
      return value;
    }
    if (lodash_isBoolean(value)) {
      return `${value}`;
    }
    if (lodash_isNumber(value)) {
      return `${CoreString.ensure_float(value)}`;
    }
    if (lodash_isArray(value)) {
      return this.numeric_array(value);
    }
    if (value instanceof Vector22 || value instanceof Vector32 || value instanceof Vector42 || value instanceof Color2) {
      return this.numeric_array(value.toArray());
    }
    return `ThreeToGl error: unknown value type '${value}'`;
  }
  static numeric_array(values) {
    const values_str = new Array(values.length);
    for (let i = 0; i < values.length; i++) {
      values_str[i] = `${CoreString.ensure_float(values[i])}`;
    }
    const gl_type = `vec${values.length}`;
    return `${gl_type}(${values_str.join(", ")})`;
  }
  static vector4(vec) {
    if (lodash_isString(vec)) {
      return vec;
    }
    const values = vec.toArray().map((v) => {
      return `${CoreString.ensure_float(v)}`;
    });
    return `vec4(${values.join(", ")})`;
  }
  static vector3(vec) {
    if (lodash_isString(vec)) {
      return vec;
    }
    const values = vec.toArray().map((v) => {
      return `${CoreString.ensure_float(v)}`;
    });
    return `vec3(${values.join(", ")})`;
  }
  static vector2(vec) {
    if (lodash_isString(vec)) {
      return vec;
    }
    const values = vec.toArray().map((v) => {
      return `${CoreString.ensure_float(v)}`;
    });
    return `vec2(${values.join(", ")})`;
  }
  static vector3_float(vec, num) {
    if (!lodash_isString(num)) {
      num = CoreString.ensure_float(num);
    }
    return `vec4(${this.vector3(vec)}, ${num})`;
  }
  static float4(x, y, z, w) {
    if (!lodash_isString(x)) {
      x = CoreString.ensure_float(x);
    }
    if (!lodash_isString(y)) {
      y = CoreString.ensure_float(y);
    }
    if (!lodash_isString(z)) {
      z = CoreString.ensure_float(z);
    }
    if (!lodash_isString(w)) {
      w = CoreString.ensure_float(w);
    }
    return `vec4(${x}, ${y}, ${z}, ${w})`;
  }
  static float3(x, y, z) {
    if (!lodash_isString(x)) {
      x = CoreString.ensure_float(x);
    }
    if (!lodash_isString(y)) {
      y = CoreString.ensure_float(y);
    }
    if (!lodash_isString(z)) {
      z = CoreString.ensure_float(z);
    }
    return `vec3(${x}, ${y}, ${z})`;
  }
  static float2(x, y) {
    if (!lodash_isString(x)) {
      x = CoreString.ensure_float(x);
    }
    if (!lodash_isString(y)) {
      y = CoreString.ensure_float(y);
    }
    return `vec2(${x}, ${y})`;
  }
  static float(x) {
    if (!lodash_isString(x)) {
      x = CoreString.ensure_float(x);
    }
    return `${x}`;
  }
  static int(x) {
    return `${x}`;
  }
  static bool(x) {
    return `${x}`;
  }
}
