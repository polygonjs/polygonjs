import {BaseSopOperation} from "./_Base";
import {TypedPathParamValue} from "../../Walker";
import {NodeContext as NodeContext2} from "../../../engine/poly/NodeContext";
import {CoreMaterial} from "../../geometry/Material";
import {GlobalsGeometryHandler} from "../../../engine/nodes/gl/code/globals/Geometry";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
import {ShaderMaterial as ShaderMaterial2} from "three/src/materials/ShaderMaterial";
export class MaterialSopOperation extends BaseSopOperation {
  constructor() {
    super(...arguments);
    this._globals_handler = new GlobalsGeometryHandler();
    this._old_mat_by_old_new_id = new Map();
    this._materials_by_uuid = new Map();
  }
  static type() {
    return "material";
  }
  async cook(input_contents, params) {
    const core_group = input_contents[0];
    this._old_mat_by_old_new_id.clear();
    await this._apply_materials(core_group, params);
    this._swap_textures(core_group, params);
    return core_group;
  }
  async _apply_materials(core_group, params) {
    if (!params.assign_mat) {
      return;
    }
    const material_node = params.material.ensure_node_context(NodeContext2.MAT, this.states?.error);
    if (material_node) {
      const material = material_node.material;
      const assembler_controller = material_node.assembler_controller;
      if (assembler_controller) {
        assembler_controller.set_assembler_globals_handler(this._globals_handler);
      }
      await material_node.request_container();
      if (material) {
        for (let object of core_group.objects_from_group(params.group)) {
          if (params.apply_to_children) {
            object.traverse((grand_child) => {
              this._apply_material(grand_child, material, params);
            });
          } else {
            this._apply_material(object, material, params);
          }
        }
        return core_group;
      } else {
        this.states?.error.set(`material invalid. (error: '${material_node.states.error.message}')`);
      }
    } else {
      this.states?.error.set(`no material node found`);
    }
  }
  _swap_textures(core_group, params) {
    if (!params.swap_current_tex) {
      return;
    }
    this._materials_by_uuid.clear();
    for (let object of core_group.objects_from_group(params.group)) {
      if (params.apply_to_children) {
        object.traverse((child) => {
          const mat = object.material;
          this._materials_by_uuid.set(mat.uuid, mat);
        });
      } else {
        const mat = object.material;
        this._materials_by_uuid.set(mat.uuid, mat);
      }
    }
    this._materials_by_uuid.forEach((mat, mat_uuid) => {
      this._swap_texture(mat, params);
    });
  }
  _apply_material(object, src_material, params) {
    const used_material = params.clone_mat ? CoreMaterial.clone(src_material) : src_material;
    if (src_material instanceof ShaderMaterial2 && used_material instanceof ShaderMaterial2) {
      for (let uniform_name in src_material.uniforms) {
        used_material.uniforms[uniform_name] = src_material.uniforms[uniform_name];
      }
    }
    const object_with_material = object;
    this._old_mat_by_old_new_id.set(used_material.uuid, object_with_material.material);
    object_with_material.material = used_material;
    CoreMaterial.apply_render_hook(object, used_material);
    CoreMaterial.apply_custom_materials(object, used_material);
  }
  _swap_texture(target_mat, params) {
    if (params.tex_src0 == "" || params.tex_dest0 == "") {
      return;
    }
    let src_mat = this._old_mat_by_old_new_id.get(target_mat.uuid);
    src_mat = src_mat || target_mat;
    const src_tex = src_mat[params.tex_src0];
    if (src_tex) {
      target_mat[params.tex_dest0] = src_tex;
      const uniforms = target_mat.uniforms;
      if (uniforms) {
        const uniforms_map = uniforms[params.tex_dest0];
        if (uniforms_map) {
          uniforms[params.tex_dest0] = {value: src_tex};
        }
      }
    }
  }
}
MaterialSopOperation.DEFAULT_PARAMS = {
  group: "",
  assign_mat: true,
  material: new TypedPathParamValue("/MAT/mesh_standard1"),
  apply_to_children: true,
  clone_mat: false,
  share_uniforms: true,
  swap_current_tex: false,
  tex_src0: "emissiveMap",
  tex_dest0: "map"
};
MaterialSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
