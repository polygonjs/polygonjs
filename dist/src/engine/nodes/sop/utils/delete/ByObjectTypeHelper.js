import {ObjectTypes, object_type_from_constructor} from "../../../../../core/geometry/Constant";
export class ByObjectTypeHelper {
  constructor(node) {
    this.node = node;
  }
  eval_for_objects(core_objects) {
    const object_type = ObjectTypes[this.node.pv.object_type];
    for (let core_object of core_objects) {
      const object = core_object.object();
      if (object_type_from_constructor(object.constructor) == object_type) {
        this.node.entity_selection_helper.select(core_object);
      }
    }
  }
}
