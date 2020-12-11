import {Vector3 as Vector32} from "three/src/math/Vector3";
import lodash_isNumber from "lodash/isNumber";
import {Easing as Easing2} from "./Easing";
const RAD_DEG_RATIO = Math.PI / 180;
const RAND_A = 12.9898;
const RAND_B = 78.233;
const RAND_C = 43758.5453;
export class CoreMath {
  static clamp(val, min, max) {
    if (val < min) {
      return min;
    } else if (val > max) {
      return max;
    } else {
      return val;
    }
  }
  static fit01(val, dest_min, dest_max) {
    return this.fit(val, 0, 1, dest_min, dest_max);
  }
  static fit(val, src_min, src_max, dest_min, dest_max) {
    const src_range = src_max - src_min;
    const dest_range = dest_max - dest_min;
    const r = (val - src_min) / src_range;
    return r * dest_range + dest_min;
  }
  static blend(num0, num1, blend) {
    return (1 - blend) * num0 + blend * num1;
  }
  static degrees_to_radians(degrees) {
    return degrees * RAD_DEG_RATIO;
  }
  static radians_to_degrees(radians) {
    return radians / RAD_DEG_RATIO;
  }
  static deg2rad(deg) {
    return this.degrees_to_radians(deg);
  }
  static rad2deg(rad) {
    return this.radians_to_degrees(rad);
  }
  static rand(number) {
    if (lodash_isNumber(number)) {
      return this.rand_float(number);
    } else {
      return this.rand_vec2(number);
    }
  }
  static round(number, step_size) {
    const steps_count = number / step_size;
    const rounded_steps_count = number < 0 ? Math.ceil(steps_count) : Math.floor(steps_count);
    return rounded_steps_count * step_size;
  }
  static highest_even(number) {
    return 2 * Math.ceil(number * 0.5);
  }
  static rand_float(x, y = 136574) {
    this._vec.x = x;
    this._vec.y = y;
    return this.rand_vec2(this._vec);
  }
  static rand_vec2(uv) {
    const dt = uv.x * RAND_A + uv.y * RAND_B;
    const sn = dt % Math.PI;
    return this.fract(Math.sin(sn) * RAND_C);
  }
  static geodesic_distance(lnglat1, lnglat2) {
    var R = 6371e3;
    var d1 = this.deg2rad(lnglat1.lat);
    var d2 = this.deg2rad(lnglat2.lat);
    var ad1 = this.deg2rad(lnglat2.lat - lnglat1.lat);
    var ad2 = this.deg2rad(lnglat2.lng - lnglat1.lng);
    var a = Math.sin(ad1 / 2) * Math.sin(ad1 / 2) + Math.cos(d1) * Math.cos(d2) * Math.sin(ad2 / 2) * Math.sin(ad2 / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }
  static expand_triangle(triangle, margin) {
    triangle.getMidpoint(this._triangle_mid);
    this._triangle_mid_to_corner.copy(triangle.a).sub(this._triangle_mid);
    this._triangle_mid_to_corner.normalize().multiplyScalar(margin);
    triangle.a.add(this._triangle_mid_to_corner);
    this._triangle_mid_to_corner.copy(triangle.b).sub(this._triangle_mid);
    this._triangle_mid_to_corner.normalize().multiplyScalar(margin);
    triangle.b.add(this._triangle_mid_to_corner);
    this._triangle_mid_to_corner.copy(triangle.c).sub(this._triangle_mid);
    this._triangle_mid_to_corner.normalize().multiplyScalar(margin);
    triangle.c.add(this._triangle_mid_to_corner);
  }
  static nearestPower2(num) {
    return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
  }
}
CoreMath.Easing = Easing2;
CoreMath.fract = (number) => number - Math.floor(number);
CoreMath._vec = {x: 0, y: 136574};
CoreMath._triangle_mid = new Vector32();
CoreMath._triangle_mid_to_corner = new Vector32();
