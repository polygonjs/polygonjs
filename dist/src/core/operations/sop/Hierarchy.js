import {BaseSopOperation} from "./_Base";
import {Group as Group3} from "three/src/objects/Group";
import {InputCloneMode as InputCloneMode2} from "../../../engine/poly/InputCloneMode";
export var HierarchyMode;
(function(HierarchyMode2) {
  HierarchyMode2["ADD_PARENT"] = "add_parent";
  HierarchyMode2["REMOVE_PARENT"] = "remove_parent";
})(HierarchyMode || (HierarchyMode = {}));
export const HIERARCHY_MODES = [HierarchyMode.ADD_PARENT, HierarchyMode.REMOVE_PARENT];
export class HierarchySopOperation extends BaseSopOperation {
  static type() {
    return "hierarchy";
  }
  cook(input_contents, params) {
    const core_group = input_contents[0];
    if (HIERARCHY_MODES[params.mode] == HierarchyMode.ADD_PARENT) {
      const objects = this._add_parent_to_core_group(core_group, params);
      return this.create_core_group_from_objects(objects);
    } else {
      const objects = this._remove_parent_from_core_group(core_group, params);
      return this.create_core_group_from_objects(objects);
    }
  }
  _add_parent_to_core_group(core_group, params) {
    if (params.levels == 0) {
      return core_group.objects();
    } else {
      const new_objects = [];
      let new_object;
      for (let object of core_group.objects()) {
        new_object = this._add_parent_to_object(object, params);
        if (new_object) {
          new_objects.push(new_object);
        }
      }
      return new_objects;
    }
  }
  _add_parent_to_object(object, params) {
    let new_parent = new Group3();
    new_parent.matrixAutoUpdate = false;
    new_parent.add(object);
    if (params.levels > 0) {
      for (let i = 0; i < params.levels - 1; i++) {
        new_parent = this._add_new_parent(new_parent, params);
      }
    }
    return new_parent;
  }
  _add_new_parent(object, params) {
    const new_parent2 = new Group3();
    new_parent2.matrixAutoUpdate = false;
    new_parent2.add(object);
    return new_parent2;
  }
  _remove_parent_from_core_group(core_group, params) {
    if (params.levels == 0) {
      return core_group.objects();
    } else {
      const new_objects = [];
      for (let object of core_group.objects()) {
        const new_children = this._remove_parent_from_object(object, params);
        for (let new_child of new_children) {
          new_objects.push(new_child);
        }
      }
      return new_objects;
    }
  }
  _remove_parent_from_object(object, params) {
    let current_children = object.children;
    for (let i = 0; i < params.levels - 1; i++) {
      current_children = this._get_children_from_objects(current_children, params);
    }
    return current_children;
  }
  _get_children_from_objects(objects, params) {
    let object;
    const children = [];
    while (object = objects.pop()) {
      if (object.children) {
        for (let child of object.children) {
          children.push(child);
        }
      }
    }
    return children;
  }
}
HierarchySopOperation.DEFAULT_PARAMS = {
  mode: 0,
  levels: 1
};
HierarchySopOperation.INPUT_CLONED_STATE = InputCloneMode2.FROM_NODE;
