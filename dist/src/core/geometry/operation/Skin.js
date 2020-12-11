import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {CoreGeometry} from "../Geometry";
import lodash_flatten from "lodash/flatten";
import lodash_intersection from "lodash/intersection";
import lodash_concat from "lodash/concat";
export class CoreGeometryOperationSkin {
  constructor(geometry, geometry1, geometry0) {
    this.geometry = geometry;
    this.geometry1 = geometry1;
    this.geometry0 = geometry0;
  }
  process() {
    const geometry_wrapper0 = new CoreGeometry(this.geometry0);
    const geometry_wrapper1 = new CoreGeometry(this.geometry1);
    const segments0 = geometry_wrapper0.segments();
    const segments1 = geometry_wrapper1.segments();
    if (segments0.length === 0 || segments1.length === 0) {
      return;
    }
    const geometries_by_segments_count = segments0.length < segments1.length ? [geometry_wrapper0, geometry_wrapper1] : [geometry_wrapper1, geometry_wrapper0];
    const smallest_geometry = geometries_by_segments_count[0];
    const largest_geometry = geometries_by_segments_count[1];
    const smallest_segments = smallest_geometry.segments();
    const largest_segments = largest_geometry.segments();
    const smallest_points = smallest_geometry.points();
    const largest_points = largest_geometry.points();
    const smallest_points_count = smallest_points.length;
    const all_points = lodash_concat(smallest_points, largest_points);
    const points_indices = [];
    smallest_segments.forEach((segment, i) => {
      const matched_segment = largest_segments[i];
      points_indices.push(segment[0]);
      points_indices.push(segment[1]);
      points_indices.push(matched_segment[0] + smallest_points_count);
      points_indices.push(segment[1]);
      points_indices.push(matched_segment[1] + smallest_points_count);
      points_indices.push(matched_segment[0] + smallest_points_count);
    });
    const attributes_in_common = lodash_intersection(smallest_geometry.attrib_names(), largest_geometry.attrib_names());
    attributes_in_common.forEach((attrib_name) => {
      const attrib_size = smallest_geometry.attrib_size(attrib_name);
      let attrib_values = all_points.map((point) => point.attrib_value(attrib_name));
      let float_values;
      if (attrib_size == 1) {
        float_values = attrib_values;
      } else {
        float_values = lodash_flatten(attrib_values.map((v) => v.toArray()));
      }
      this.geometry.setAttribute(attrib_name, new Float32BufferAttribute(float_values, attrib_size));
    });
    this.geometry.setIndex(points_indices);
    this.geometry.computeVertexNormals();
  }
}
