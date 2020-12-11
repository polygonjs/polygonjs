import {CoreGeometry} from "../Geometry";
import {BufferGeometryUtils as BufferGeometryUtils2} from "../../../modules/three/examples/jsm/utils/BufferGeometryUtils";
import {CoreGeometryIndexBuilder} from "../util/IndexBuilder";
export class CoreGeometryBuilderMerge {
  static merge(geometries) {
    if (geometries.length === 0) {
      return;
    }
    for (let geometry of geometries) {
      CoreGeometryIndexBuilder.create_index_if_none(geometry);
    }
    const core_geometries = geometries.map((geometry) => new CoreGeometry(geometry));
    const indexed_attribute_names = core_geometries[0].indexed_attribute_names();
    const new_values_by_attribute_name = {};
    for (let indexed_attribute_name of indexed_attribute_names) {
      const index_by_values = {};
      const all_geometries_points = [];
      for (let core_geometry of core_geometries) {
        const geometry_points = core_geometry.points();
        for (let point of geometry_points) {
          all_geometries_points.push(point);
          const value = point.indexed_attrib_value(indexed_attribute_name);
          index_by_values[value] != null ? index_by_values[value] : index_by_values[value] = Object.keys(index_by_values).length;
        }
      }
      const values = Object.keys(index_by_values);
      for (let point of all_geometries_points) {
        const value = point.indexed_attrib_value(indexed_attribute_name);
        const new_index = index_by_values[value];
        point.set_attrib_index(indexed_attribute_name, new_index);
      }
      new_values_by_attribute_name[indexed_attribute_name] = values;
    }
    const merged_geometry = BufferGeometryUtils2.mergeBufferGeometries(geometries);
    const merged_geometry_wrapper = new CoreGeometry(merged_geometry);
    Object.keys(new_values_by_attribute_name).forEach((indexed_attribute_name) => {
      const values = new_values_by_attribute_name[indexed_attribute_name];
      merged_geometry_wrapper.set_indexed_attribute_values(indexed_attribute_name, values);
    });
    if (merged_geometry) {
      delete merged_geometry.userData.mergedUserData;
    }
    return merged_geometry;
  }
}
