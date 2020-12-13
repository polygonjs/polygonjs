import {CoreGeometry} from "./Geometry";
export class CoreScene {
  constructor(_scene) {
    this._scene = _scene;
  }
  scene() {
    return this._scene;
  }
  with_overriden_material(base_material, instance_material, uniforms, callback) {
    const original_material_by_object_id = {};
    let assigned_material;
    this._scene.traverse((object3d) => {
      const object = object3d;
      if (object.material) {
        const geometry = object.geometry;
        if (geometry) {
          const custom_dof_material = object.customDepthDOFMaterial;
          if (custom_dof_material) {
            assigned_material = custom_dof_material;
            if (assigned_material.uniforms) {
              for (let k of Object.keys(uniforms)) {
                assigned_material.uniforms[k].value = uniforms[k].value;
              }
            }
          } else {
            if (CoreGeometry.marked_as_instance(geometry)) {
              assigned_material = instance_material;
            } else {
              assigned_material = base_material;
            }
          }
          if (assigned_material) {
            original_material_by_object_id[object.uuid] = object.material;
            object.material = assigned_material;
          }
        }
      }
    });
    callback();
    this._scene.traverse((object3d) => {
      const object = object3d;
      if (object.material) {
        const geometry = object.geometry;
        if (geometry) {
          object.material = original_material_by_object_id[object.uuid];
        }
      }
    });
    for (let key of Object.keys(original_material_by_object_id)) {
      delete original_material_by_object_id[key];
    }
  }
}
