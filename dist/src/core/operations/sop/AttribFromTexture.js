import {BaseSopOperation} from "./_Base";
import {TypedPathParamValue} from "../../Walker";
import {NodeContext as NodeContext2} from "../../../engine/poly/NodeContext";
import {AttribFromTexture as AttribFromTexture2} from "../../geometry/operation/AttribFromTexture";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class AttribFromTextureSopOperation extends BaseSopOperation {
  static type() {
    return "attrib_from_texture";
  }
  async cook(input_contents, params) {
    const core_group = input_contents[0];
    const texture_node = params.texture.ensure_node_context(NodeContext2.COP, this.states?.error);
    if (!texture_node) {
      return core_group;
    }
    const container = await texture_node.request_container();
    const texture = container.texture();
    for (let core_object of core_group.core_objects()) {
      this._set_position_from_data_texture(core_object, texture, params);
    }
    return core_group;
  }
  _set_position_from_data_texture(core_object, texture, params) {
    const geometry = core_object.core_geometry()?.geometry();
    if (!geometry) {
      return;
    }
    const uv_attrib = geometry.getAttribute("uv");
    if (uv_attrib == null) {
      this.states?.error.set("uvs are required");
      return;
    }
    const operation = new AttribFromTexture2();
    operation.set_attrib({
      geometry,
      texture,
      uv_attrib_name: "uv",
      target_attrib_name: params.attrib,
      target_attrib_size: 1,
      add: params.add,
      mult: params.mult
    });
  }
}
AttribFromTextureSopOperation.DEFAULT_PARAMS = {
  texture: new TypedPathParamValue(TypedPathParamValue.DEFAULT.UV),
  uv_attrib: "uv",
  attrib: "pscale",
  add: 0,
  mult: 1
};
AttribFromTextureSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
