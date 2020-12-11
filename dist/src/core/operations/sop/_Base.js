import {CoreGroup} from "../../geometry/Group";
import {BaseOperation} from "../_Base";
import {NodeContext as NodeContext2} from "../../../engine/poly/NodeContext";
import {ObjectType, OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE, CoreConstant} from "../../geometry/Constant";
import {CoreGeometryIndexBuilder} from "../../geometry/util/IndexBuilder";
export class BaseSopOperation extends BaseOperation {
  static context() {
    return NodeContext2.SOP;
  }
  cook(input_contents, params) {
  }
  create_core_group_from_objects(objects) {
    const core_group = new CoreGroup();
    core_group.set_objects(objects);
    return core_group;
  }
  create_core_group_from_geometry(geometry, type = ObjectType.MESH) {
    const object = BaseSopOperation.create_object(geometry, type);
    return this.create_core_group_from_objects([object]);
  }
  create_object(geometry, type, material) {
    return BaseSopOperation.create_object(geometry, type, material);
  }
  static create_object(geometry, type, material) {
    this.create_index_if_none(geometry);
    const object_constructor = OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE[type];
    material = material || CoreConstant.MATERIALS[type].clone();
    const object = new object_constructor(geometry, material);
    object.castShadow = true;
    object.receiveShadow = true;
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;
    return object;
  }
  create_index_if_none(geometry) {
    BaseSopOperation.create_index_if_none(geometry);
  }
  static create_index_if_none(geometry) {
    CoreGeometryIndexBuilder.create_index_if_none(geometry);
  }
}
