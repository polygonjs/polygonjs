import lodash_range from "lodash/range";
const POSITION = "position";
export class CoreGeometryIndexBuilder {
  static create_index_if_none(geometry) {
    if (!geometry.index) {
      const position = geometry.getAttribute(POSITION);
      if (position) {
        const position_array = position.array;
        geometry.setIndex(lodash_range(position_array.length / 3));
      }
    }
  }
}
