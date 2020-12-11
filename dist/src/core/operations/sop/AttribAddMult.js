import {BaseSopOperation} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class AttribAddMultSopOperation extends BaseSopOperation {
  static type() {
    return "attrib_add_mult";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    const attrib_names = core_group.attrib_names_matching_mask(params.name);
    for (let attrib_name of attrib_names) {
      const geometries = core_group.geometries();
      for (let geometry of geometries) {
        this._update_attrib(attrib_name, geometry, params);
      }
    }
    return core_group;
  }
  _update_attrib(attrib_name, geometry, params) {
    const attribute = geometry.getAttribute(attrib_name);
    if (attribute) {
      const values = attribute.array;
      const pre_add = params.pre_add;
      const mult = params.mult;
      const post_add = params.post_add;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        values[i] = (value + pre_add) * mult + post_add;
      }
      attribute.needsUpdate = true;
    }
  }
}
AttribAddMultSopOperation.DEFAULT_PARAMS = {
  name: "",
  pre_add: 0,
  mult: 1,
  post_add: 0
};
AttribAddMultSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
