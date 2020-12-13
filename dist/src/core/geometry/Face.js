import lodash_sum from "lodash/sum";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Triangle as Triangle2} from "three/src/math/Triangle";
import {CorePoint} from "./Point";
import {CoreMath} from "../math/_Module";
export class CoreFace {
  constructor(_core_geometry, _index) {
    this._core_geometry = _core_geometry;
    this._index = _index;
    this._geometry = this._core_geometry.geometry();
  }
  get index() {
    return this._index;
  }
  get points() {
    return this._points = this._points || this._get_points();
  }
  _get_points() {
    const index_array = this._geometry.index?.array || [];
    const start = this._index * 3;
    return [
      new CorePoint(this._core_geometry, index_array[start + 0]),
      new CorePoint(this._core_geometry, index_array[start + 1]),
      new CorePoint(this._core_geometry, index_array[start + 2])
    ];
  }
  get positions() {
    return this._positions = this._positions || this._get_positions();
  }
  _get_positions() {
    const points = this.points;
    return [points[0].position(), points[1].position(), points[2].position()];
  }
  get triangle() {
    return this._triangle = this._triangle || this._get_triangle();
  }
  _get_triangle() {
    const positions = this.positions;
    return new Triangle2(positions[0], positions[1], positions[2]);
  }
  get deltas() {
    return this._deltas = this._deltas || this._get_deltas();
  }
  _get_deltas() {
    return [this.positions[1].clone().sub(this.positions[0]), this.positions[2].clone().sub(this.positions[0])];
  }
  get area() {
    return this.triangle.getArea();
  }
  center(target) {
    const positions = this.positions;
    target.x = (positions[0].x + positions[1].x + positions[2].x) / 3;
    target.y = (positions[0].y + positions[1].y + positions[2].y) / 3;
    target.z = (positions[0].z + positions[1].z + positions[2].z) / 3;
    return target;
  }
  random_position(seed) {
    let weights = [CoreMath.rand_float(seed), CoreMath.rand_float(seed * 6541)];
    if (weights[0] + weights[1] > 1) {
      weights[0] = 1 - weights[0];
      weights[1] = 1 - weights[1];
    }
    return this.positions[0].clone().add(this.deltas[0].clone().multiplyScalar(weights[0])).add(this.deltas[1].clone().multiplyScalar(weights[1]));
  }
  attrib_value_at_position(attrib_name, position) {
    const barycentric_coordinates = new Vector32();
    this.triangle.getBarycoord(position, barycentric_coordinates);
    const weights = barycentric_coordinates.toArray();
    const attrib = this._geometry.attributes[attrib_name];
    const attrib_size = attrib.itemSize;
    const point_values = this.points.map((point) => point.attrib_value(attrib_name));
    let new_attrib_value;
    let sum2;
    let index = 0;
    switch (attrib_size) {
      case 1: {
        sum2 = 0;
        for (let point_value of point_values) {
          sum2 += point_value * weights[index];
          index++;
        }
        new_attrib_value = sum2;
        break;
      }
      default: {
        for (let point_value of point_values) {
          const weighted_value = point_value.multiplyScalar(weights[index]);
          if (sum2) {
            sum2.add(weighted_value);
          } else {
            sum2 = weighted_value;
          }
          index++;
        }
        new_attrib_value = sum2;
      }
    }
    return new_attrib_value;
  }
  static interpolated_value(geometry, face, intersect_point, attrib) {
    const point_indices = [face.a, face.b, face.c];
    const position_attrib = geometry.getAttribute("position");
    const position_attrib_array = position_attrib.array;
    const point_positions = point_indices.map((point_index) => new Vector32(position_attrib_array[point_index * 3 + 0], position_attrib_array[point_index * 3 + 1], position_attrib_array[point_index * 3 + 2]));
    const attrib_size = attrib.itemSize;
    const attrib_array = attrib.array;
    let attrib_values = [];
    switch (attrib_size) {
      case 1:
        attrib_values = point_indices.map((point_index) => attrib_array[point_index]);
        break;
      case 2:
        attrib_values = point_indices.map((point_index) => new Vector22(attrib_array[point_index * 2 + 0], attrib_array[point_index * 2 + 1]));
        break;
      case 3:
        attrib_values = point_indices.map((point_index) => new Vector32(attrib_array[point_index * 3 + 0], attrib_array[point_index * 3 + 1], attrib_array[point_index * 3 + 2]));
        break;
    }
    const dist_to_points = point_indices.map((point_index, i) => intersect_point.distanceTo(point_positions[i]));
    const distance_total = lodash_sum([
      dist_to_points[0] * dist_to_points[1],
      dist_to_points[0] * dist_to_points[2],
      dist_to_points[1] * dist_to_points[2]
    ]);
    const weights = [
      dist_to_points[1] * dist_to_points[2] / distance_total,
      dist_to_points[0] * dist_to_points[2] / distance_total,
      dist_to_points[0] * dist_to_points[1] / distance_total
    ];
    let new_attrib_value;
    switch (attrib_size) {
      case 1:
        new_attrib_value = lodash_sum(point_indices.map((point_indx, i) => weights[i] * attrib_values[i]));
        break;
      default:
        var values = point_indices.map((point_index, i) => attrib_values[i].multiplyScalar(weights[i]));
        new_attrib_value = null;
        for (let value of values) {
          if (new_attrib_value) {
            new_attrib_value.add(value);
          } else {
            new_attrib_value = value;
          }
        }
    }
    return new_attrib_value;
  }
}
