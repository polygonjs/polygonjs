import lodash_isNaN from "lodash/isNaN";
import {CoreGraphNode as CoreGraphNode2} from "../../../core/graph/CoreGraphNode";
import {NodeEvent as NodeEvent2} from "../../poly/NodeEvent";
export class NameController {
  constructor(node) {
    this.node = node;
    this._graph_node = new CoreGraphNode2(node.scene, "node_name_controller");
  }
  get graph_node() {
    return this._graph_node;
  }
  static base_name(node) {
    let base = node.type;
    const last_char = base[base.length - 1];
    if (!lodash_isNaN(parseInt(last_char))) {
      base += "_";
    }
    return `${base}1`;
  }
  request_name_to_parent(new_name) {
    const parent = this.node.parent;
    if (parent && parent.children_allowed() && parent.children_controller) {
      parent.children_controller.set_child_name(this.node, new_name);
    } else {
      console.warn("request_name_to_parent failed, no parent found");
    }
  }
  set_name(new_name) {
    if (new_name != this.node.name) {
      this.request_name_to_parent(new_name);
    }
  }
  update_name_from_parent(new_name) {
    this.node._set_core_name(new_name);
    this.post_set_name();
    this.run_post_set_full_path_hooks();
    if (this.node.children_allowed()) {
      const children = this.node.children_controller?.children();
      if (children) {
        for (let child_node of children) {
          child_node.name_controller.run_post_set_full_path_hooks();
        }
      }
    }
    if (this.node.lifecycle.creation_completed) {
      this.node.scene.missing_expression_references_controller.check_for_missing_references(this.node);
      this.node.scene.expressions_controller.regenerate_referring_expressions(this.node);
    }
    this.node.scene.references_controller.notify_name_updated(this.node);
    this.node.emit(NodeEvent2.NAME_UPDATED);
  }
  add_post_set_name_hook(hook) {
    this._on_set_name_hooks = this._on_set_name_hooks || [];
    this._on_set_name_hooks.push(hook);
  }
  add_post_set_full_path_hook(hook) {
    this._on_set_full_path_hooks = this._on_set_full_path_hooks || [];
    this._on_set_full_path_hooks.push(hook);
  }
  post_set_name() {
    if (this._on_set_name_hooks) {
      for (let hook of this._on_set_name_hooks) {
        hook();
      }
    }
  }
  run_post_set_full_path_hooks() {
    if (this._on_set_full_path_hooks) {
      for (let hook of this._on_set_full_path_hooks) {
        hook();
      }
    }
  }
}
