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
    this._queued_nodes_by_id = {};
    this._queued_nodes_by_path = {};
    this._expected_geo_nodes = {};
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
  create_node(type, params_init_value_overrides) {
    const node = super.create_node(type, params_init_value_overrides);
    if (node.dirty_controller.is_dirty) {
      node.request_container();
    }
    return node;
  }
  createNode(node_class, params_init_value_overrides) {
    const node = super.createNode(node_class, params_init_value_overrides);
    if (node.dirty_controller.is_dirty) {
      node.request_container();
    }
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
  add_to_queue(node) {
    const id = node.graph_node_id;
    if (this._queued_nodes_by_id[id] == null) {
      return this._queued_nodes_by_id[id] = node;
    }
  }
  async process_queue() {
    this._queued_nodes_by_path = {};
    const ids = Object.keys(this._queued_nodes_by_id);
    for (let id of ids) {
      const node = this._queued_nodes_by_id[id];
      delete this._queued_nodes_by_id[id];
      const full_path = `_____${node.render_order}__${node.full_path()}`;
      this._queued_nodes_by_path[full_path] = node;
    }
    const promises = Object.keys(this._queued_nodes_by_path).sort().map((path_id) => {
      const node = this._queued_nodes_by_path[path_id];
      return this.update_object(node);
    });
    this._expected_geo_nodes = this._expected_geo_nodes || await this.expected_loading_geo_nodes_by_id();
    Promise.all(promises).then(() => {
    });
  }
  update_object(node) {
    if (!this.scene.loading_controller.auto_updating) {
      this.add_to_queue(node);
    } else {
      this.add_to_scene(node);
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
  add_to_scene(node) {
    if (node.attachable_to_hierarchy) {
      const parent_object = node.root.get_parent_for_node(node);
      if (parent_object) {
        if (node.used_in_scene) {
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
  async expected_loading_geo_nodes_by_id() {
    const geo_nodes = this.nodes_by_type("geo");
    const node_by_id = {};
    for (let geo_node of geo_nodes) {
      const is_displayed = await geo_node.is_displayed();
      if (is_displayed) {
        node_by_id[geo_node.graph_node_id] = geo_node;
      }
    }
    return node_by_id;
  }
  add_to_parent_transform(node) {
    this.update_object(node);
  }
  remove_from_parent_transform(node) {
    this.update_object(node);
  }
  _on_child_add(node) {
    if (node) {
      this.update_object(node);
    }
  }
  _on_child_remove(node) {
    if (node) {
      this.remove_from_scene(node);
    }
  }
}
