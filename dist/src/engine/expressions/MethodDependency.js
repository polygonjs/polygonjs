import lodash_isNumber from "lodash/isNumber";
import {CoreGraphNode as CoreGraphNode2} from "../../core/graph/CoreGraphNode";
export class MethodDependency extends CoreGraphNode2 {
  constructor(param, path_argument, decomposed_path) {
    super(param.scene, "MethodDependency");
    this.param = param;
    this.path_argument = path_argument;
    this.decomposed_path = decomposed_path;
    this._update_from_name_change_bound = this._update_from_name_change.bind(this);
    this.add_post_dirty_hook("_update_from_name_change", this._update_from_name_change_bound);
  }
  _update_from_name_change(trigger) {
    if (trigger && this.decomposed_path) {
      const node = trigger;
      this.decomposed_path.update_from_name_change(node);
      const new_path = this.decomposed_path.to_path();
      const literal = this.jsep_node;
      if (literal) {
        literal.value = `${literal.value}`.replace(`${this.path_argument}`, new_path);
        literal.raw = literal.raw.replace(`${this.path_argument}`, new_path);
      }
      if (this.param.expression_controller) {
        this.param.expression_controller.update_from_method_dependency_name_change();
      }
    }
  }
  reset() {
    this.graph_disconnect_predecessors();
  }
  listen_for_name_changes() {
    if (this.jsep_node && this.decomposed_path) {
      for (let node_in_path of this.decomposed_path.named_nodes()) {
        if (node_in_path) {
          const node = node_in_path;
          if (node.name_controller) {
            this.add_graph_input(node.name_controller.graph_node);
          }
        }
      }
    }
  }
  set_jsep_node(jsep_node) {
    this.jsep_node = jsep_node;
  }
  set_resolved_graph_node(node) {
    this.resolved_graph_node = node;
  }
  set_unresolved_path(path) {
    this.unresolved_path = path;
  }
  static create(param, index_or_path, node, decomposed_path) {
    const is_index = lodash_isNumber(index_or_path);
    const instance = new MethodDependency(param, index_or_path, decomposed_path);
    if (node) {
      instance.set_resolved_graph_node(node);
    } else {
      if (!is_index) {
        const path = index_or_path;
        instance.set_unresolved_path(path);
      }
    }
    return instance;
  }
}
