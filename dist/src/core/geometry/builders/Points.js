import {CoreGeometryBuilderBase} from "./_Base";
export class CoreGeometryBuilderPoints extends CoreGeometryBuilderBase {
  _filter_points(points) {
    return points;
  }
  _indices_from_points(new_index_by_old_index, old_geometry) {
    const index_attrib = old_geometry.index;
    if (index_attrib != null) {
      const old_indices = index_attrib.array;
      const new_indices = [];
      let old_index;
      let new_index;
      for (let i = 0; i < old_indices.length; i++) {
        old_index = old_indices[i];
        new_index = new_index_by_old_index[old_index];
        if (new_index != null) {
          new_indices.push(new_index);
        }
      }
      return new_indices;
    }
  }
}
