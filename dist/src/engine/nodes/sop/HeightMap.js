import {TypedSopNode} from "./_Base";
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {CoreImage} from "../../../core/Image";
import {OPERATOR_PATH_DEFAULT} from "../../params/OperatorPath";
class HeightMapSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.texture = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, {
      node_selection: {context: NodeContext2.COP}
    });
    this.mult = ParamConfig.FLOAT(1);
  }
}
const ParamsConfig2 = new HeightMapSopParamsConfig();
export class HeightMapSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "height_map";
  }
  initialize_node() {
    this.io.inputs.set_count(1);
    this.io.inputs.init_inputs_cloned_state(InputCloneMode2.FROM_NODE);
  }
  async cook(input_contents) {
    const core_group = input_contents[0];
    const node = this.p.texture.found_node();
    if (node) {
      const node_context = node.node_context();
      if (node_context == NodeContext2.COP) {
        const texture_node = node;
        const container = await texture_node.request_container();
        const texture = container.texture();
        for (let core_object of core_group.core_objects()) {
          this._set_position_from_data_texture(core_object, texture);
        }
      } else {
        this.states.error.set("found node is not a texture");
      }
    }
    core_group.compute_vertex_normals();
    this.set_core_group(core_group);
  }
  _set_position_from_data_texture(core_object, texture) {
    const texture_data = this._data_from_texture(texture);
    if (!texture_data) {
      return;
    }
    const {data, resx, resy} = texture_data;
    const texture_component_size = data.length / (resx * resy);
    const geometry = core_object.core_geometry()?.geometry();
    if (!geometry) {
      return;
    }
    const positions = geometry.getAttribute("position").array;
    const uv_attrib = geometry.getAttribute("uv");
    const normal_attrib = geometry.getAttribute("normal");
    if (uv_attrib == null) {
      this.states.error.set("uvs are required");
      return;
    }
    if (normal_attrib == null) {
      this.states.error.set("normals are required");
      return;
    }
    const uvs = uv_attrib.array;
    const normals = normal_attrib.array;
    const points_count = positions.length / 3;
    let uv_stride, uvx, uvy, x, y, j, val;
    let index = 0;
    for (let i = 0; i < points_count; i++) {
      uv_stride = i * 2;
      uvx = uvs[uv_stride];
      uvy = uvs[uv_stride + 1];
      x = Math.floor((resx - 1) * uvx);
      y = Math.floor((resy - 1) * (1 - uvy));
      j = y * resx + x;
      val = data[texture_component_size * j];
      index = i * 3;
      positions[index + 0] += normals[index + 0] * val * this.pv.mult;
      positions[index + 1] += normals[index + 1] * val * this.pv.mult;
      positions[index + 2] += normals[index + 2] * val * this.pv.mult;
    }
  }
  _data_from_texture(texture) {
    if (texture.image) {
      if (texture.image.data) {
        return this._data_from_data_texture(texture);
      }
      return this._data_from_default_texture(texture);
    }
  }
  _data_from_default_texture(texture) {
    const resx = texture.image.width;
    const resy = texture.image.height;
    const image_data = CoreImage.data_from_image(texture.image);
    const data = image_data.data;
    return {
      data,
      resx,
      resy
    };
  }
  _data_from_data_texture(texture) {
    const data = texture.image.data;
    const resx = texture.image.width;
    const resy = texture.image.height;
    return {
      data,
      resx,
      resy
    };
  }
}
