import {Matrix3 as Matrix32} from "three/src/math/Matrix3";
import {MaterialLoader as MaterialLoader2} from "three/src/loaders/MaterialLoader";
const POSSIBLE_MAP_NAMES = ["map", "alphaMap", "envMap"];
export class BasePersistedConfig {
  constructor(node) {
    this.node = node;
    this._found_uniform_texture_by_id = new Map();
    this._found_uniform_textures_id_by_uniform_name = new Map();
    this._found_param_texture_by_id = new Map();
    this._found_param_textures_id_by_uniform_name = new Map();
  }
  to_json() {
  }
  load(data) {
  }
  _material_to_json(material) {
    this._unassign_textures(material);
    const material_data = material.toJSON({});
    if (material.lights != null) {
      material_data.lights = material.lights;
    }
    this._reassign_textures(material);
    return material_data;
  }
  _unassign_textures(material) {
    this._found_uniform_texture_by_id.clear();
    this._found_uniform_textures_id_by_uniform_name.clear();
    this._found_param_texture_by_id.clear();
    this._found_param_textures_id_by_uniform_name.clear();
    const uniforms = material.uniforms;
    const names = Object.keys(uniforms);
    for (let name of names) {
      const value = uniforms[name].value;
      if (value && value.uuid) {
        const texture = value;
        this._found_uniform_texture_by_id.set(texture.uuid, value);
        this._found_uniform_textures_id_by_uniform_name.set(name, texture.uuid);
        uniforms[name].value = null;
      }
    }
    for (let name of POSSIBLE_MAP_NAMES) {
      const texture = material[name];
      if (texture) {
        this._found_param_texture_by_id.set(texture.uuid, texture);
        this._found_param_textures_id_by_uniform_name.set(name, texture.uuid);
        material[name] = null;
      }
    }
  }
  _reassign_textures(material) {
    const uniform_names_needing_reassignment = [];
    const param_names_needing_reassignment = [];
    this._found_uniform_textures_id_by_uniform_name.forEach((texture_id, name) => {
      uniform_names_needing_reassignment.push(name);
    });
    this._found_param_textures_id_by_uniform_name.forEach((texture_id, name) => {
      param_names_needing_reassignment.push(name);
    });
    const uniforms = material.uniforms;
    for (let name of uniform_names_needing_reassignment) {
      const texture_id = this._found_uniform_textures_id_by_uniform_name.get(name);
      if (texture_id) {
        const texture = this._found_uniform_texture_by_id.get(texture_id);
        if (texture) {
          uniforms[name].value = texture;
        }
      }
    }
    for (let name of param_names_needing_reassignment) {
      const texture_id = this._found_param_textures_id_by_uniform_name.get(name);
      if (texture_id) {
        const texture = this._found_param_texture_by_id.get(texture_id);
        if (texture) {
          material[name] = texture;
        }
      }
    }
  }
  _load_material(data) {
    data.color = void 0;
    const loader = new MaterialLoader2();
    const material = loader.parse(data);
    if (data.lights != null) {
      material.lights = data.lights;
    }
    const uv2Transform = material.uniforms.uv2Transform;
    if (uv2Transform) {
      this.mat4_to_mat3(uv2Transform);
    }
    const uvTransform = material.uniforms.uvTransform;
    if (uvTransform) {
      this.mat4_to_mat3(uvTransform);
    }
    return material;
  }
  mat4_to_mat3(uniform) {
    const mat4 = uniform.value;
    const last_element = mat4.elements[mat4.elements.length - 1];
    if (last_element == null) {
      const mat3 = new Matrix32();
      for (let i = 0; i < mat3.elements.length; i++) {
        mat3.elements[i] = mat4.elements[i];
      }
      uniform.value = mat3;
    }
  }
}
