import {Group as Group2} from "three/src/objects/Group";
import {TypedBaseManagerNode} from "./_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {NodeParamsConfig} from "../utils/params/ParamsConfig";
class ObjectsManagerParamsConfig extends NodeParamsConfig {
}
const ParamsConfig2 = new ObjectsManagerParamsConfig();
export class ObjectsManagerNode extends TypedBaseManagerNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
    this._object = new Group2();
    this._queued_nodes_by_id = new Map();
    this._children_controller_context = NodeContext2.OBJ;
  }
  static type() {
    return "obj";
  }
  initialize_node() {
    this._object.matrixAutoUpdate = false;
    this.lifecycle.add_on_child_add_hook(this._on_child_add.bind(this));
    this.lifecycle.add_on_child_remove_hook(this._on_child_remove.bind(this));
  }
  init_default_scene() {
    this._object.name = "_WORLD_";
    this._scene.default_scene.add(this._object);
  }
  object() {
    return this._object;
  }
  createNode(node_class, params_init_value_overrides) {
    const node = super.createNode(node_class, params_init_value_overrides);
    return node;
  }
  children() {
    return super.children();
  }
  nodes_by_type(type) {
    return super.nodes_by_type(type);
  }
  multiple_display_flags_allowed() {
    return true;
  }
  _add_to_queue(node) {
    console.warn("_add_to_queue", node.full_path());
    const id = node.graph_node_id;
    if (!this._queued_nodes_by_id.has(id)) {
      this._queued_nodes_by_id.set(id, node);
    }
    return node;
  }
  async process_queue() {
    const queued_nodes_by_path = new Map();
    const paths = [];
    this._queued_nodes_by_id.forEach((node, id) => {
      const full_path = `_____${node.render_order}__${node.full_path()}`;
      paths.push(full_path);
      queued_nodes_by_path.set(full_path, node);
    });
    this._queued_nodes_by_id.clear();
    for (let path_id of paths) {
      const node = queued_nodes_by_path.get(path_id);
      if (node) {
        queued_nodes_by_path.delete(path_id);
        this._add_to_scene(node);
      }
    }
  }
  _update_object(node) {
    if (!this.scene.loading_controller.auto_updating) {
      return this._add_to_queue(node);
    } else {
      return this._add_to_scene(node);
    }
  }
  get_parent_for_node(node) {
    if (node.attachable_to_hierarchy) {
      const node_input = node.io.inputs.input(0);
      if (node_input) {
        return node_input.children_group;
      } else {
        return this._object;
      }
    } else {
      return null;
    }
  }
  _add_to_scene(node) {
    if (node.attachable_to_hierarchy) {
      const parent_object = node.root.get_parent_for_node(node);
      if (parent_object) {
        if (node.used_in_scene) {
          node.request_container();
          node.children_display_controller?.request_display_node_container();
          node.add_object_to_parent(parent_object);
        } else {
          node.remove_object_from_parent();
        }
      } else {
      }
    }
  }
  remove_from_scene(node) {
    node.remove_object_from_parent();
  }
  are_children_cooking() {
    const children = this.children();
    for (let child of children) {
      if (child.cook_controller.is_cooking || child.is_display_node_cooking()) {
        return true;
      }
    }
    return false;
  }
  add_to_parent_transform(node) {
    this._update_object(node);
  }
  remove_from_parent_transform(node) {
    this._update_object(node);
  }
  _on_child_add(node) {
    if (node) {
      this._update_object(node);
    }
  }
  _on_child_remove(node) {
    if (node) {
      this.remove_from_scene(node);
    }
  }
}
