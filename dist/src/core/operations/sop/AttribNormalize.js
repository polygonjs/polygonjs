import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {CoreString} from "../../String";
export var NormalizeMode;
(function(NormalizeMode2) {
  NormalizeMode2["MIN_MAX_TO_01"] = "min/max to 0/1";
  NormalizeMode2["VECTOR_TO_LENGTH_1"] = "vectors to length 1";
})(NormalizeMode || (NormalizeMode = {}));
export const NORMALIZE_MODES = [NormalizeMode.MIN_MAX_TO_01, NormalizeMode.VECTOR_TO_LENGTH_1];
export class AttribNormalizeSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this.min3 = new Vector32();
    this.max3 = new Vector32();
    this._vec = new Vector32();
  }
  static type() {
    return "attrib_normalize";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    const objects = input_contents[0].objects_with_geo();
    const attrib_names = CoreString.attrib_names(params.name);
    for (let object of objects) {
      const geometry = object.geometry;
      for (let attrib_name of attrib_names) {
        const src_attrib = geometry.getAttribute(attrib_name);
        if (src_attrib) {
          let dest_attrib = src_attrib;
          if (params.change_name && params.new_name != "") {
            dest_attrib = geometry.getAttribute(params.new_name);
            if (dest_attrib) {
              dest_attrib.needsUpdate = true;
            }
            dest_attrib = dest_attrib || src_attrib.clone();
          }
          this._normalize_attribute(src_attrib, dest_attrib, params);
        }
      }
    }
    return core_group;
  }
  _normalize_attribute(src_attrib, dest_attrib, params) {
    const mode = NORMALIZE_MODES[params.mode];
    switch (mode) {
      case NormalizeMode.MIN_MAX_TO_01:
        return this._normalize_from_min_max_to_01(src_attrib, dest_attrib);
      case NormalizeMode.VECTOR_TO_LENGTH_1:
        return this._normalize_vectors(src_attrib, dest_attrib);
    }
  }
  _normalize_from_min_max_to_01(src_attrib, dest_attrib) {
    const attrib_size = src_attrib.itemSize;
    const src_array = src_attrib.array;
    const dest_array = dest_attrib.array;
    switch (attrib_size) {
      case 1: {
        const minf = Math.min(...src_array);
        const maxf = Math.max(...src_array);
        for (let i = 0; i < dest_array.length; i++) {
          dest_array[i] = (src_array[i] - minf) / (maxf - minf);
        }
        return;
      }
      case 3: {
        const points_count = src_array.length / attrib_size;
        const xs = new Array(points_count);
        const ys = new Array(points_count);
        const zs = new Array(points_count);
        let j = 0;
        for (let i = 0; i < points_count; i++) {
          j = i * attrib_size;
          xs[i] = src_array[j + 0];
          ys[i] = src_array[j + 1];
          zs[i] = src_array[j + 2];
        }
        this.min3.set(Math.min(...xs), Math.min(...ys), Math.min(...zs));
        this.max3.set(Math.max(...xs), Math.max(...ys), Math.max(...zs));
        for (let i = 0; i < points_count; i++) {
          j = i * attrib_size;
          dest_array[j + 0] = (xs[i] - this.min3.x) / (this.max3.x - this.min3.x);
          dest_array[j + 1] = (ys[i] - this.min3.y) / (this.max3.y - this.min3.y);
          dest_array[j + 2] = (zs[i] - this.min3.z) / (this.max3.z - this.min3.z);
        }
        return;
      }
    }
  }
  _normalize_vectors(src_attrib, dest_attrib) {
    const src_array = src_attrib.array;
    const dest_array = dest_attrib.array;
    const elements_count = src_array.length;
    if (src_attrib.itemSize == 3) {
      for (let i = 0; i < elements_count; i += 3) {
        this._vec.fromArray(src_array, i);
        this._vec.normalize();
        this._vec.toArray(dest_array, i);
      }
    }
  }
}
AttribNormalizeSopOperation.DEFAULT_PARAMS = {
  mode: 0,
  name: "position",
  change_name: false,
  new_name: ""
};
AttribNormalizeSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
