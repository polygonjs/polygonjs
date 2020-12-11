import {CoreGeometry} from "../Geometry";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
export class CoreGeometryUtilCurve {
  static accumulated_curve_point_indices(indices) {
    let curve_point_indices = [];
    const accumulated_curve_point_indices = [];
    let last_index_added = null;
    let index;
    for (let i = 0; i < indices.length; i++) {
      if (i % 2 === 1) {
        index = indices[i];
        const previous_index = indices[i - 1];
        if (last_index_added == null || previous_index === last_index_added) {
          if (curve_point_indices.length === 0) {
            curve_point_indices.push(previous_index);
          }
          curve_point_indices.push(index);
          last_index_added = index;
        } else {
          accumulated_curve_point_indices.push(curve_point_indices);
          curve_point_indices = [previous_index, index];
          last_index_added = index;
        }
      }
    }
    accumulated_curve_point_indices.push(curve_point_indices);
    return accumulated_curve_point_indices;
  }
  static create_line_segment_geometry(points, indices, attrib_names, attrib_sizes_by_name) {
    const new_indices = [];
    const new_attribute_values_by_name = {};
    attrib_names.forEach((attrib_name) => {
      new_attribute_values_by_name[attrib_name] = [];
    });
    indices.forEach((index, i) => {
      const point = points[index];
      attrib_names.forEach((attrib_name) => {
        const attrib_value = point.attrib_value(attrib_name);
        const attrib_size = attrib_sizes_by_name[attrib_name];
        let attrib_value_f;
        if (attrib_size > 1) {
          attrib_value_f = attrib_value.toArray();
        } else {
          attrib_value_f = [attrib_value];
        }
        attrib_value_f.forEach((v) => {
          new_attribute_values_by_name[attrib_name].push(v);
        });
      });
      if (i > 0) {
        new_indices.push(i - 1);
        new_indices.push(i);
      }
    });
    const geometry = new BufferGeometry2();
    attrib_names.forEach((attrib_name) => {
      const attrib_size = attrib_sizes_by_name[attrib_name];
      const values = new_attribute_values_by_name[attrib_name];
      geometry.setAttribute(attrib_name, new Float32BufferAttribute(values, attrib_size));
    });
    geometry.setIndex(new_indices);
    return geometry;
  }
  static line_segment_to_geometries(geometry) {
    const geometries = [];
    const core_geometry = new CoreGeometry(geometry);
    const attrib_names = core_geometry.attrib_names();
    const points = core_geometry.points();
    const indices = geometry.getIndex()?.array || [];
    const accumulated_curve_point_indices = this.accumulated_curve_point_indices(indices);
    if (accumulated_curve_point_indices.length > 0) {
      const attribute_sizes_by_name = core_geometry.attrib_sizes();
      accumulated_curve_point_indices.forEach((curve_point_indices, i) => {
        geometry = this.create_line_segment_geometry(points, curve_point_indices, attrib_names, attribute_sizes_by_name);
        geometries.push(geometry);
      });
    }
    return geometries;
  }
}
