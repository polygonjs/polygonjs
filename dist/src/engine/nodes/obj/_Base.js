import {Object3D as Object3D2} from "three/src/core/Object3D";
import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {Group as Group2} from "three/src/objects/Group";
const INPUT_OBJECT_NAME = "parent object";
const DEFAULT_INPUT_NAMES = [INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME, INPUT_OBJECT_NAME];
export var ObjNodeRenderOrder;
(function(ObjNodeRenderOrder2) {
  ObjNodeRenderOrder2[ObjNodeRenderOrder2["MANAGER"] = 0] = "MANAGER";
  ObjNodeRenderOrder2[ObjNodeRenderOrder2["CAMERA"] = 2] = "CAMERA";
  ObjNodeRenderOrder2[ObjNodeRenderOrder2["LIGHT"] = 3] = "LIGHT";
})(ObjNodeRenderOrder || (ObjNodeRenderOrder = {}));
export class TypedObjNode extends TypedNode {
  constructor() {
    super(...arguments);
    this.render_order = 0;
    this._children_group = this._create_children_group();
    this._attachable_to_hierarchy = true;
    this._used_in_scene = true;
  }
  static node_context() {
    return NodeContext2.OBJ;
  }
  static displayed_input_names() {
    return DEFAULT_INPUT_NAMES;
  }
  _create_children_group() {
    const group = new Group2();
    group.matrixAutoUpdate = false;
    return group;
  }
  get attachable_to_hierarchy() {
    return this._attachable_to_hierarchy;
  }
  get used_in_scene() {
    return this._used_in_scene;
  }
  set_used_in_scene(state) {
    this._used_in_scene = state;
    if (!this.scene.loading_controller.is_loading) {
      const root = this.parent;
      if (root) {
        root.update_object(this);
      }
    }
  }
  add_object_to_parent(parent) {
    if (this.attachable_to_hierarchy) {
      parent.add(this.object);
    }
  }
  remove_object_from_parent() {
    if (this.attachable_to_hierarchy) {
      const parent = this.object.parent;
      if (parent) {
        parent.remove(this.object);
      }
    }
  }
  initialize_base_node() {
    this._object = this._create_object_with_attributes();
    this.name_controller.add_post_set_full_path_hook(this.set_object_name.bind(this));
    this.set_object_name();
  }
  get children_group() {
    return this._children_group;
  }
  get object() {
    return this._object;
  }
  _create_object_with_attributes() {
    const object = this.create_object();
    object.node = this;
    object.add(this._children_group);
    return object;
  }
  set_object_name() {
    if (this._object) {
      this._object.name = this.full_path();
      this._children_group.name = `${this.full_path()}:parented_outputs`;
    }
  }
  create_object() {
    const object = new Object3D2();
    object.matrixAutoUpdate = false;
    return object;
  }
  is_display_node_cooking() {
    if (this.display_node_controller) {
      if (this.display_node_controller.display_node) {
        return this.display_node_controller.display_node.cook_controller.is_cooking;
      }
    }
    return false;
  }
  is_displayed() {
    return this.flags?.display?.active || false;
  }
}
export class BaseObjNodeClass extends TypedObjNode {
}
