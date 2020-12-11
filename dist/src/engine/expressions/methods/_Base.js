import {CoreWalker} from "../../../core/Walker";
import {DecomposedPath as DecomposedPath2} from "../../../core/DecomposedPath";
import {MethodDependency as MethodDependency2} from "../MethodDependency";
import lodash_isString from "lodash/isString";
import lodash_isNumber from "lodash/isNumber";
import {Poly as Poly2} from "../../Poly";
export class BaseMethod {
  constructor(param) {
    this.param = param;
    this._require_dependency = false;
  }
  require_dependency() {
    return this._require_dependency;
  }
  get node() {
    return this._node = this._node || this.param.node;
  }
  static required_arguments() {
    console.warn("Expression.Method._Base.required_arguments virtual method call. Please override");
    return [];
  }
  static optional_arguments() {
    return [];
  }
  static min_allowed_arguments_count() {
    return this.required_arguments().length;
  }
  static max_allowed_arguments_count() {
    return this.min_allowed_arguments_count() + this.optional_arguments().length;
  }
  static allowed_arguments_count(count) {
    return count >= this.min_allowed_arguments_count() && count <= this.max_allowed_arguments_count();
  }
  process_arguments(args) {
    throw "Expression.Method._Base.process_arguments virtual method call. Please override";
  }
  async get_referenced_node_container(index_or_path) {
    const referenced_node = this.get_referenced_node(index_or_path);
    if (referenced_node) {
      let container;
      if (referenced_node.is_dirty) {
        container = await referenced_node.request_container();
      } else {
        container = referenced_node.container_controller.container;
      }
      if (container) {
        const core_group = container.core_content();
        if (core_group) {
          return container;
        }
      }
      throw `referenced node invalid: ${referenced_node.full_path()}`;
    } else {
      throw `invalid input (${index_or_path})`;
    }
  }
  get_referenced_param(path, decomposed_path) {
    if (this.node) {
      return CoreWalker.find_param(this.node, path, decomposed_path);
    }
    return null;
  }
  find_referenced_graph_node(index_or_path, decomposed_path) {
    const is_index = lodash_isNumber(index_or_path);
    if (is_index) {
      const index = index_or_path;
      if (this.node) {
        const input_graph_node = this.node.io.inputs.input_graph_node(index);
        return input_graph_node;
      }
    } else {
      const path = index_or_path;
      return this.get_referenced_node(path, decomposed_path);
    }
    return null;
  }
  get_referenced_node(index_or_path, decomposed_path) {
    let node = null;
    if (lodash_isString(index_or_path)) {
      if (this.node) {
        const path = index_or_path;
        node = CoreWalker.find_node(this.node, path, decomposed_path);
      }
    } else {
      if (this.node) {
        const index = index_or_path;
        node = this.node.io.inputs.input(index);
      }
    }
    return node || null;
  }
  find_dependency(args) {
    return null;
  }
  create_dependency_from_index_or_path(index_or_path) {
    const decomposed_path = new DecomposedPath2();
    const node = this.find_referenced_graph_node(index_or_path, decomposed_path);
    if (node) {
      return this.create_dependency(node, index_or_path, decomposed_path);
    } else {
      Poly2.warn("node not found for path", index_or_path);
    }
    return null;
  }
  create_dependency(node, index_or_path, decomposed_path) {
    const dependency = MethodDependency2.create(this.param, index_or_path, node, decomposed_path);
    return dependency;
  }
}
