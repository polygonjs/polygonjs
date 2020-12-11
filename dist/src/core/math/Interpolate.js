import lodash_max from "lodash/max";
import lodash_isNumber from "lodash/isNumber";
import lodash_sum from "lodash/sum";
export class CoreInterpolate {
  static perform(point_dest, points_src, attrib_name, distance_threshold, blend_with) {
    switch (points_src.length) {
      case 0:
        return 0;
      case 1:
        return this._interpolate_with_1_point(point_dest, points_src[0], attrib_name, distance_threshold, blend_with);
      default:
        return this._interpolate_with_multiple_points(point_dest, points_src, attrib_name, distance_threshold, blend_with);
    }
  }
  static _interpolate_with_1_point(point_dest, point_src, attrib_name, distance_threshold, blend_with) {
    const position_dest = point_dest.position();
    const position_src = point_src.position();
    const distance = position_dest.distanceTo(position_src);
    const value_src = point_src.attrib_value(attrib_name);
    if (lodash_isNumber(value_src)) {
      return this._weighted_value_from_distance(point_dest, value_src, attrib_name, distance, distance_threshold, blend_with);
    } else {
      console.warn("value is not a number", value_src);
      return 0;
    }
  }
  static _weight_from_distance(distance, distance_threshold, blend_with) {
    return (distance - distance_threshold) / blend_with;
  }
  static _weighted_value_from_distance(point_dest, value_src, attrib_name, distance, distance_threshold, blend_with) {
    if (distance <= distance_threshold) {
      return value_src;
    } else {
      const value_dest = point_dest.attrib_value(attrib_name);
      if (lodash_isNumber(value_dest)) {
        const blend = this._weight_from_distance(distance, distance_threshold, blend_with);
        return blend * value_dest + (1 - blend) * value_src;
      } else {
        console.warn("value is not a number", value_dest);
        return 0;
      }
    }
  }
  static _interpolate_with_multiple_points(point_dest, points_src, attrib_name, distance_threshold, blend_with) {
    const weighted_values_src = points_src.map((point_src) => {
      return this._interpolate_with_1_point(point_dest, point_src, attrib_name, distance_threshold, blend_with);
    });
    return lodash_max(weighted_values_src) || 0;
  }
  static weights(current_position, other_positions) {
    switch (other_positions.length) {
      case 1:
        return 1;
      case 2:
        return this._weights_from_2(current_position, other_positions);
      default:
        other_positions = other_positions.slice(0, 3);
        return this._weights_from_3(current_position, other_positions);
    }
  }
  static _weights_from_2(current_position, other_positions) {
    const dist_to_positions = other_positions.map((other_position) => current_position.distanceTo(other_position));
    const distance_total = lodash_sum(dist_to_positions);
    return [dist_to_positions[1] / distance_total, dist_to_positions[0] / distance_total];
  }
  static _weights_from_3(current_position, other_positions) {
    const dist_to_positions = other_positions.map((other_position) => current_position.distanceTo(other_position));
    const distance_total = lodash_sum([
      dist_to_positions[0] * dist_to_positions[1],
      dist_to_positions[0] * dist_to_positions[2],
      dist_to_positions[1] * dist_to_positions[2]
    ]);
    return [
      dist_to_positions[1] * dist_to_positions[2] / distance_total,
      dist_to_positions[0] * dist_to_positions[2] / distance_total,
      dist_to_positions[0] * dist_to_positions[1] / distance_total
    ];
  }
}
