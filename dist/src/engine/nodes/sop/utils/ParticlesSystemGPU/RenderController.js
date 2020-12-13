import lodash_cloneDeep from "lodash/cloneDeep";
import {CoreMaterial} from "../../../../../core/geometry/Material";
import {GlobalsTextureHandler} from "../../../gl/code/globals/Texture";
export class ParticlesSystemGpuRenderController {
  constructor(node) {
    this.node = node;
    this._particles_group_objects = [];
    this._all_shader_names = [];
    this._all_uniform_names = [];
    this.globals_handler = new GlobalsTextureHandler(GlobalsTextureHandler.UV_VARYING);
  }
  set_shaders_by_name(shaders_by_name) {
    this._shaders_by_name = shaders_by_name;
    this._all_shader_names = [];
    this._all_uniform_names = [];
    this._shaders_by_name.forEach((shader, name) => {
      this._all_shader_names.push(name);
      this._all_uniform_names.push(`texture_${name}`);
    });
    this.reset_render_material();
  }
  assign_render_material() {
    if (!this._render_material) {
      return;
    }
    for (let object3d of this._particles_group_objects) {
      const object = object3d;
      if (object.geometry) {
        object.material = this._render_material;
        CoreMaterial.apply_custom_materials(object, this._render_material);
        object.matrixAutoUpdate = false;
        object.updateMatrix();
      }
    }
    this._render_material.needsUpdate = true;
    this.update_render_material_uniforms();
  }
  update_render_material_uniforms() {
    if (!this._render_material) {
      return;
    }
    let uniform_name;
    let shader_name;
    for (let i = 0; i < this._all_shader_names.length; i++) {
      shader_name = this._all_shader_names[i];
      uniform_name = this._all_uniform_names[i];
      const texture = this.node.gpu_controller.getCurrentRenderTarget(shader_name)?.texture;
      if (texture) {
        this._render_material.uniforms[uniform_name].value = texture;
        CoreMaterial.assign_custom_uniforms(this._render_material, uniform_name, texture);
      }
    }
  }
  reset_render_material() {
    this._render_material = void 0;
    this._particles_group_objects = [];
  }
  render_material() {
    return this._render_material;
  }
  get initialized() {
    return this._render_material != null;
  }
  init_core_group(core_group) {
    for (let child of core_group.objects_with_geo()) {
      this._particles_group_objects.push(child);
    }
  }
  async init_render_material() {
    const assembler = this.node.assembler_controller?.assembler;
    if (this._render_material) {
      return;
    }
    if (this.node.p.material.is_dirty) {
      await this.node.p.material.compute();
    }
    const mat_node = this.node.p.material.found_node();
    if (mat_node) {
      if (assembler) {
        const new_texture_allocations_json = assembler.texture_allocations_controller.to_json(this.node.scene);
        if (mat_node.assembler_controller) {
          this.globals_handler.set_texture_allocations_controller(assembler.texture_allocations_controller);
          mat_node.assembler_controller.set_assembler_globals_handler(this.globals_handler);
        }
        if (!this._texture_allocations_json || JSON.stringify(this._texture_allocations_json) != JSON.stringify(new_texture_allocations_json)) {
          this._texture_allocations_json = lodash_cloneDeep(new_texture_allocations_json);
          if (mat_node.assembler_controller) {
            mat_node.assembler_controller.set_compilation_required_and_dirty();
          }
        }
      }
      const container = await mat_node.request_container();
      this._render_material = container.material();
    } else {
      this.node.states.error.set("render material not valid");
    }
    if (this._render_material) {
      const uniforms = this._render_material.uniforms;
      for (let uniform_name of this._all_uniform_names) {
        const uniform_value = {value: null};
        uniforms[uniform_name] = uniform_value;
        if (this._render_material) {
          CoreMaterial.init_custom_material_uniforms(this._render_material, uniform_name, uniform_value);
        }
      }
    }
    this.assign_render_material();
  }
}
