import {BasePersistedConfig} from "../../../../utils/PersistedConfig";
import {GlParamConfig} from "../../utils/ParamConfig";
import {Poly as Poly2} from "../../../../../Poly";
export class MaterialPersistedConfig extends BasePersistedConfig {
  constructor(node) {
    super(node);
    this.node = node;
  }
  to_json() {
    if (!this.node.assembler_controller) {
      return;
    }
    const custom_materials_data = {};
    const custom_materials = this.node.material.custom_materials;
    if (custom_materials) {
      const custom_material_names = Object.keys(custom_materials);
      for (let name of custom_material_names) {
        const custom_material = custom_materials[name];
        if (custom_material) {
          custom_materials_data[name] = this._material_to_json(custom_material);
        }
      }
    }
    const param_uniform_pairs = [];
    const param_configs = this.node.assembler_controller.assembler.param_configs();
    for (let param_config of param_configs) {
      param_uniform_pairs.push([param_config.name, param_config.uniform_name]);
    }
    const data = {
      material: this._material_to_json(this.node.material),
      uniforms_time_dependent: this.node.assembler_controller.assembler.uniforms_time_dependent(),
      uniforms_resolution_dependent: this.node.assembler_controller.assembler.resolution_dependent(),
      param_uniform_pairs,
      custom_materials: custom_materials_data
    };
    return data;
  }
  load(data) {
    this._material = this._load_material(data.material);
    if (!this._material) {
      return;
    }
    this._material.custom_materials = this._material.custom_materials || {};
    if (data.custom_materials) {
      const names = Object.keys(data.custom_materials);
      for (let name of names) {
        const custom_mat_data = data.custom_materials[name];
        const custom_mat = this._load_material(custom_mat_data);
        if (custom_mat) {
          this._material.custom_materials[name] = custom_mat;
        }
      }
    }
    if (data.uniforms_time_dependent) {
      this.node.scene.uniforms_controller.add_time_dependent_uniform_owner(this._material.uuid, this._material.uniforms);
    }
    if (data.uniforms_resolution_dependent) {
      this.node.scene.uniforms_controller.add_resolution_dependent_uniform_owner(this._material.uuid, this._material.uniforms);
    }
    if (data.param_uniform_pairs) {
      for (let pair of data.param_uniform_pairs) {
        const param = this.node.params.get(pair[0]);
        const uniform = this._material.uniforms[pair[1]];
        if (param && uniform) {
          param.options.set_option("callback", () => {
            GlParamConfig.callback(param, uniform);
          });
        }
      }
    }
  }
  material() {
    if (Poly2.instance().player_mode()) {
      return this._material;
    }
  }
}
