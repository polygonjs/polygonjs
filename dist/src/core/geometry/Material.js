import {UniformsUtils as UniformsUtils2} from "three/src/renderers/shaders/UniformsUtils";
var CustomMaterialName;
(function(CustomMaterialName2) {
  CustomMaterialName2["customDistanceMaterial"] = "customDistanceMaterial";
  CustomMaterialName2["customDepthMaterial"] = "customDepthMaterial";
  CustomMaterialName2["customDepthDOFMaterial"] = "customDepthDOFMaterial";
})(CustomMaterialName || (CustomMaterialName = {}));
const RENDER_HOOK_USER_DATA_KEY = "POLY_render_hook";
const EMPTY_RENDER_HOOK = (renderer, scene, camera, geometry, material, group) => {
};
export class CoreMaterial {
  static node(scene, material) {
    return scene.node(material.name);
  }
  static clone(src_material) {
    const cloned_material = src_material.clone();
    const src_uniforms = src_material.uniforms;
    if (src_uniforms) {
      cloned_material.uniforms = UniformsUtils2.clone(src_uniforms);
    }
    return cloned_material;
  }
  static add_user_data_render_hook(material, render_hook) {
    material.userData[RENDER_HOOK_USER_DATA_KEY] = render_hook;
  }
  static apply_render_hook(object, material) {
    if (material.userData) {
      const render_hook = material.userData[RENDER_HOOK_USER_DATA_KEY];
      if (render_hook) {
        object.onBeforeRender = (renderer, scene, camera, geometry, material2, group) => {
          render_hook(renderer, scene, camera, geometry, material2, group, object);
        };
        return;
      }
    }
    object.onBeforeRender = EMPTY_RENDER_HOOK;
  }
  static apply_custom_materials(object, material) {
    const material_with_custom = material;
    if (material_with_custom.custom_materials) {
      for (let name of Object.keys(material_with_custom.custom_materials)) {
        const mat_name = name;
        const custom_material = material_with_custom.custom_materials[mat_name];
        if (custom_material) {
          object[mat_name] = custom_material;
          custom_material.needsUpdate = true;
        }
      }
    }
  }
  static assign_custom_uniforms(mat, uniform_name, uniform_value) {
    const material = mat;
    if (material.custom_materials) {
      for (let name of Object.keys(material.custom_materials)) {
        const mat_name = name;
        const custom_material = material.custom_materials[mat_name];
        if (custom_material) {
          custom_material.uniforms[uniform_name].value = uniform_value;
        }
      }
    }
  }
  static init_custom_material_uniforms(mat, uniform_name, uniform_value) {
    const material = mat;
    if (material.custom_materials) {
      for (let name of Object.keys(material.custom_materials)) {
        const mat_name = name;
        const custom_material = material.custom_materials[mat_name];
        if (custom_material) {
          custom_material.uniforms[uniform_name] = custom_material.uniforms[uniform_name] || uniform_value;
        }
      }
    }
  }
}
