import {BasePersistedConfig} from "../../../../utils/PersistedConfig";
import {TextureAllocationsController as TextureAllocationsController2} from "../../utils/TextureAllocationsController";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
import {Poly as Poly2} from "../../../../../Poly";
export class ParticlesPersistedConfig extends BasePersistedConfig {
  constructor(node) {
    super(node);
    this.node = node;
  }
  to_json() {
    if (!this.node.assembler_controller) {
      return;
    }
    const shaders_by_name = {};
    const node_shaders_by_name = this.node.shaders_by_name();
    node_shaders_by_name.forEach((shader, shader_name) => {
      shaders_by_name[shader_name] = shader;
    });
    const texture_allocations_data = this.node.assembler_controller.assembler.texture_allocations_controller.to_json(this.node.scene);
    const param_uniform_pairs = [];
    const uniforms_owner = new ShaderMaterial2();
    const param_configs = this.node.assembler_controller.assembler.param_configs();
    for (let param_config of param_configs) {
      param_uniform_pairs.push([param_config.name, param_config.uniform_name]);
      uniforms_owner.uniforms[param_config.uniform_name] = param_config.uniform;
    }
    return {
      shaders_by_name,
      texture_allocations: texture_allocations_data,
      param_uniform_pairs,
      uniforms_owner: this._material_to_json(uniforms_owner)
    };
  }
  load(data) {
    if (!Poly2.instance().player_mode()) {
      return;
    }
    this._loaded_data = data;
    this.node.init_with_persisted_config();
  }
  loaded_data() {
    return this._loaded_data;
  }
  shaders_by_name() {
    if (this._loaded_data) {
      const shaders_by_name = new Map();
      const shader_names = Object.keys(this._loaded_data.shaders_by_name);
      for (let shader_name of shader_names) {
        shaders_by_name.set(shader_name, this._loaded_data.shaders_by_name[shader_name]);
      }
      return shaders_by_name;
    }
  }
  texture_allocations_controller() {
    if (this._loaded_data) {
      return TextureAllocationsController2.from_json(this._loaded_data.texture_allocations);
    }
  }
  uniforms() {
    if (this._loaded_data) {
      const uniforms_owner = this._load_material(this._loaded_data.uniforms_owner);
      const uniforms = uniforms_owner?.uniforms || {};
      return uniforms;
    }
  }
}
