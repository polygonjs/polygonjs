import {BaseController as BaseController2} from "./_BaseController";
import {ParamConfig} from "../../utils/params/ParamsConfig";
import {NodeContext as NodeContext2} from "../../../poly/NodeContext";
import {OPERATOR_PATH_DEFAULT} from "../../../params/OperatorPath";
export function TextureMapParamConfig(Base5) {
  return class Mixin extends Base5 {
    constructor() {
      super(...arguments);
      this.use_map = ParamConfig.BOOLEAN(0);
      this.map = ParamConfig.OPERATOR_PATH(OPERATOR_PATH_DEFAULT.NODE.UV, {visible_if: {use_map: 1}});
    }
  };
}
export function BooleanParamOptions(controller_class) {
  return {
    cook: false,
    callback: (node, param) => {
      controller_class.update(node);
    }
  };
}
export function OperatorPathOptions(controller, use_map_name) {
  return {
    visible_if: {[use_map_name]: 1},
    node_selection: {context: NodeContext2.COP},
    cook: false,
    callback: (node, param) => {
      controller.update(node);
    }
  };
}
export class BaseTextureMapController extends BaseController2 {
  constructor(node, _update_options) {
    super(node);
    this.node = node;
    this._update_options = _update_options;
  }
  add_hooks(use_map_param, path_param) {
    use_map_param.add_post_dirty_hook("TextureController", () => {
      this.update();
    });
    path_param.add_post_dirty_hook("TextureController", () => {
      this.update();
    });
  }
  static update(node) {
  }
  async _update(material, mat_attrib_name, use_map_param, path_param) {
    if (this._update_options.uniforms) {
      const shader_material = material;
      const attr_name = mat_attrib_name;
      await this._update_texture_on_uniforms(shader_material, attr_name, use_map_param, path_param);
    }
    if (this._update_options.direct_params) {
      const mat = material;
      const attr_name = mat_attrib_name;
      await this._update_texture_on_material(mat, attr_name, use_map_param, path_param);
    }
  }
  async _update_texture_on_uniforms(material, mat_attrib_name, use_map_param, path_param) {
    this._update_required_attribute(material, material.uniforms, mat_attrib_name, use_map_param, path_param, this._apply_texture_on_uniforms.bind(this), this._remove_texture_from_uniforms.bind(this));
  }
  _apply_texture_on_uniforms(material, uniforms, mat_attrib_name, texture) {
    const has_texture = uniforms[mat_attrib_name] != null && uniforms[mat_attrib_name].value != null;
    let new_texture_is_different = false;
    if (has_texture) {
      const current_texture = uniforms[mat_attrib_name].value;
      if (current_texture.uuid != texture.uuid) {
        new_texture_is_different = true;
      }
    }
    if (!has_texture || new_texture_is_different) {
      uniforms[mat_attrib_name].value = texture;
      this._apply_texture_on_material(material, material, mat_attrib_name, texture);
      material.needsUpdate = true;
    }
  }
  _remove_texture_from_uniforms(material, uniforms, mat_attrib_name) {
    if (uniforms[mat_attrib_name].value) {
      uniforms[mat_attrib_name].value = null;
      this._remove_texture_from_material(material, material, mat_attrib_name);
      material.needsUpdate = true;
    }
  }
  async _update_texture_on_material(material, mat_attrib_name, use_map_param, path_param) {
    this._update_required_attribute(material, material, mat_attrib_name, use_map_param, path_param, this._apply_texture_on_material.bind(this), this._remove_texture_from_material.bind(this));
  }
  _apply_texture_on_material(material, texture_owner, mat_attrib_name, texture) {
    const has_texture = texture_owner[mat_attrib_name] != null;
    let new_texture_is_different = false;
    if (has_texture) {
      const current_texture = texture_owner[mat_attrib_name];
      if (current_texture.uuid != texture.uuid) {
        new_texture_is_different = true;
      }
    }
    if (!has_texture || new_texture_is_different) {
      texture_owner[mat_attrib_name] = texture;
      material.needsUpdate = true;
    }
  }
  _remove_texture_from_material(material, texture_owner, mat_attrib_name) {
    if (texture_owner[mat_attrib_name]) {
      texture_owner[mat_attrib_name] = null;
      material.needsUpdate = true;
    }
  }
  async _update_required_attribute(material, texture_owner, mat_attrib_name, use_map_param, path_param, update_callback, remove_callback) {
    if (use_map_param.is_dirty) {
      await use_map_param.compute();
    }
    const use_map = use_map_param.value;
    if (use_map) {
      if (path_param.is_dirty) {
        await path_param.compute();
      }
      const found_node = path_param.found_node();
      if (found_node) {
        if (found_node.node_context() == NodeContext2.COP) {
          const texture_node = found_node;
          const container = await texture_node.request_container();
          const texture = container.texture();
          if (texture) {
            update_callback(material, texture_owner, mat_attrib_name, texture);
            return;
          } else {
            this.node.states.error.set(`found node has no texture`);
          }
        } else {
          this.node.states.error.set(`found map node is not a COP node`);
        }
      } else {
        this.node.states.error.set(`could not find map node ${path_param.name} with path ${path_param.value}`);
      }
    }
    remove_callback(material, texture_owner, mat_attrib_name);
  }
}
