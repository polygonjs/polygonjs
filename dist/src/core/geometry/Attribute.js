import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Vector2 as Vector22} from "three/src/math/Vector2";
export var Attribute;
(function(Attribute2) {
  Attribute2["POSITION"] = "position";
  Attribute2["NORMAL"] = "normal";
  Attribute2["TANGENT"] = "tangent";
})(Attribute || (Attribute = {}));
const ATTRIB_NAME_MAP = {
  P: "position",
  N: "normal",
  Cd: "color"
};
export class CoreAttribute {
  static remap_name(name) {
    return ATTRIB_NAME_MAP[name] || name;
  }
  static array_to_indexed_arrays(array) {
    const index_by_value = {};
    let current_index = 0;
    const indices = [];
    const values = [];
    let i = 0;
    while (i < array.length) {
      const value = array[i];
      const index = index_by_value[value];
      if (index != null) {
        indices.push(index);
      } else {
        values.push(value);
        indices.push(current_index);
        index_by_value[value] = current_index;
        current_index += 1;
      }
      i++;
    }
    return {
      indices,
      values
    };
  }
  static default_value(size) {
    switch (size) {
      case 1:
        return 0;
      case 2:
        return new Vector22(0, 0);
      case 3:
        return new Vector32(0, 0, 0);
      default:
        throw `size ${size} not yet implemented`;
    }
  }
  static copy(src, dest, mark_as_needs_update = true) {
    const src_array = src?.array;
    const dest_array = dest?.array;
    if (src_array && dest_array) {
      const min_length = Math.min(src_array.length, dest_array.length);
      for (let i = 0; i < min_length; i++) {
        dest_array[i] = src_array[i];
      }
      if (mark_as_needs_update) {
        dest.needsUpdate = true;
      }
    }
  }
}
