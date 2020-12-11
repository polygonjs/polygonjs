import {BaseSopOperation} from "./_Base";
import {ObjectType, object_type_from_constructor} from "../../geometry/Constant";
import {MapUtils as MapUtils2} from "../../MapUtils";
import {CoreGeometry} from "../../geometry/Geometry";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export class MergeSopOperation extends BaseSopOperation {
  static type() {
    return "merge";
  }
  cook(input_contents, params) {
    let all_objects = [];
    for (let input_core_group of input_contents) {
      if (input_core_group) {
        const objects = input_core_group.objects();
        for (let object of objects) {
          object.traverse((child) => {
            all_objects.push(child);
          });
        }
      }
    }
    if (params.compact) {
      all_objects = this._make_compact(all_objects);
    }
    for (let object of all_objects) {
      object.traverse((o) => {
        o.matrixAutoUpdate = false;
      });
    }
    return this.create_core_group_from_objects(all_objects);
  }
  _make_compact(all_objects) {
    const materials_by_object_type = new Map();
    const objects_by_type = new Map();
    objects_by_type.set(ObjectType.MESH, []);
    objects_by_type.set(ObjectType.POINTS, []);
    objects_by_type.set(ObjectType.LINE_SEGMENTS, []);
    const ordered_object_types = [];
    for (let object of all_objects) {
      object.traverse((object3d) => {
        const object2 = object3d;
        if (object2.geometry) {
          const object_type = object_type_from_constructor(object2.constructor);
          if (!ordered_object_types.includes(object_type)) {
            ordered_object_types.push(object_type);
          }
          if (object_type) {
            const found_mat = materials_by_object_type.get(object_type);
            if (!found_mat) {
              materials_by_object_type.set(object_type, object2.material);
            }
            MapUtils2.push_on_array_at_entry(objects_by_type, object_type, object2);
          }
        }
      });
    }
    const merged_objects = [];
    ordered_object_types.forEach((object_type) => {
      const objects = objects_by_type.get(object_type);
      if (objects) {
        const geometries = [];
        for (let object of objects) {
          const geometry = object.geometry;
          geometry.applyMatrix4(object.matrix);
          geometries.push(geometry);
        }
        try {
          const merged_geometry = CoreGeometry.merge_geometries(geometries);
          if (merged_geometry) {
            const material = materials_by_object_type.get(object_type);
            const object = this.create_object(merged_geometry, object_type, material);
            merged_objects.push(object);
          } else {
            this.states?.error.set("merge failed, check that input geometries have the same attributes");
          }
        } catch (e) {
          this.states?.error.set(e);
        }
      }
    });
    return merged_objects;
  }
}
MergeSopOperation.DEFAULT_PARAMS = {
  compact: true
};
MergeSopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
