import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {CoreGeometry} from "../Geometry";
import lodash_uniq from "lodash/uniq";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
export class CoreGeometryBuilderBase {
  from_points(points) {
    points = this._filter_points(points);
    const geometry = new BufferGeometry2();
    const core_geometry = new CoreGeometry(geometry);
    const first_point = points[0];
    if (first_point != null) {
      const old_geometry = first_point.geometry();
      const old_core_geometry = first_point.geometry_wrapper();
      const new_index_by_old_index = {};
      for (let i = 0; i < points.length; i++) {
        new_index_by_old_index[points[i].index] = i;
      }
      const indices = this._indices_from_points(new_index_by_old_index, old_geometry);
      if (indices) {
        geometry.setIndex(indices);
      }
      const {attributes} = old_geometry;
      for (let attribute_name of Object.keys(attributes)) {
        const attrib_values = old_core_geometry.user_data_attribs()[attribute_name];
        const is_attrib_indexed = attrib_values != null;
        if (is_attrib_indexed) {
          const new_values = lodash_uniq(points.map((point) => point.indexed_attrib_value(attribute_name)));
          const new_index_by_value = {};
          new_values.forEach((new_value, i) => new_index_by_value[new_value] = i);
          core_geometry.user_data_attribs()[attribute_name] = new_values;
          const new_attrib_indices = [];
          for (let point of points) {
            const new_index = new_index_by_value[point.indexed_attrib_value(attribute_name)];
            new_attrib_indices.push(new_index);
          }
          geometry.setAttribute(attribute_name, new Float32BufferAttribute(new_attrib_indices, 1));
        } else {
          const attrib_size = attributes[attribute_name].itemSize;
          const values = new Array(points.length * attrib_size);
          switch (attrib_size) {
            case 1:
              for (let i = 0; i < points.length; i++) {
                values[i] = points[i].attrib_value(attribute_name);
              }
              break;
            default:
              let value;
              for (let i = 0; i < points.length; i++) {
                value = points[i].attrib_value(attribute_name);
                value.toArray(values, i * attrib_size);
              }
              break;
          }
          geometry.setAttribute(attribute_name, new Float32BufferAttribute(values, attrib_size));
        }
      }
    }
    return geometry;
  }
}
