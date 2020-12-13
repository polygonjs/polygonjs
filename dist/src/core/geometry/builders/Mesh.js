import {CoreGeometryBuilderBase} from "./_Base";
export class CoreGeometryBuilderMesh extends CoreGeometryBuilderBase {
  _filter_points(points) {
    const first_point = points[0];
    if (first_point) {
      const geometry = first_point.geometry();
      const indices = geometry.getIndex()?.array;
      if (indices) {
        const points_by_index = {};
        for (let point of points) {
          points_by_index[point.index] = point;
        }
        const filtered_points = [];
        const index_length = indices.length;
        let pt0;
        let pt1;
        let pt2;
        for (let i = 0; i < index_length; i += 3) {
          pt0 = points_by_index[indices[i + 0]];
          pt1 = points_by_index[indices[i + 1]];
          pt2 = points_by_index[indices[i + 2]];
          if (pt0 && pt1 && pt2) {
            filtered_points.push(pt0);
            filtered_points.push(pt1);
            filtered_points.push(pt2);
          }
        }
        return filtered_points;
      }
    }
    return [];
  }
  _indices_from_points(new_index_by_old_index, old_geometry) {
    const index_attrib = old_geometry.index;
    if (index_attrib != null) {
      const old_indices = index_attrib.array;
      const new_indices = [];
      let old_index0;
      let old_index1;
      let old_index2;
      let new_index0;
      let new_index1;
      let new_index2;
      for (let i = 0; i < old_indices.length; i += 3) {
        old_index0 = old_indices[i + 0];
        old_index1 = old_indices[i + 1];
        old_index2 = old_indices[i + 2];
        new_index0 = new_index_by_old_index[old_index0];
        new_index1 = new_index_by_old_index[old_index1];
        new_index2 = new_index_by_old_index[old_index2];
        if (new_index0 != null && new_index1 != null && new_index2 != null) {
          new_indices.push(new_index0);
          new_indices.push(new_index1);
          new_indices.push(new_index2);
        }
      }
      return new_indices;
    }
  }
}
