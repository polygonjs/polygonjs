import {MissingExpressionReference} from "../../expressions/MissingReference";
import {MapUtils as MapUtils2} from "../../../core/MapUtils";
import {CoreWalker} from "../../../core/Walker";
export class MissingReferencesController {
  constructor(scene) {
    this.scene = scene;
    this.references = new Map();
  }
  register(param, jsep_node, path_argument) {
    const missing_expression_reference = new MissingExpressionReference(param, path_argument);
    MapUtils2.push_on_array_at_entry(this.references, param.graph_node_id, missing_expression_reference);
    return missing_expression_reference;
  }
  deregister_param(param) {
    this.references.delete(param.graph_node_id);
  }
  resolve_missing_references() {
    const resolved_references = [];
    this.references.forEach((references) => {
      for (let reference of references) {
        if (this._is_reference_resolvable(reference)) {
          resolved_references.push(reference);
        }
      }
    });
    for (let reference of resolved_references) {
      reference.resolve_missing_dependencies();
    }
  }
  _is_reference_resolvable(reference) {
    const absolute_path = reference.absolute_path();
    if (absolute_path) {
      const node = this.scene.node(absolute_path);
      if (node) {
        return true;
      } else {
        const paths = CoreWalker.split_parent_child(absolute_path);
        if (paths.child) {
          const parent_node = this.scene.node(paths.parent);
          if (parent_node) {
            const param = parent_node.params.get(paths.child);
            if (param) {
              return true;
            }
          }
        }
      }
    }
  }
  check_for_missing_references(node) {
    this._check_for_missing_references_for_node(node);
    for (let param of node.params.all) {
      this._check_for_missing_references_for_param(param);
    }
  }
  _check_for_missing_references_for_node(node) {
    const id = node.graph_node_id;
    this.references.forEach((missing_references, node_id) => {
      let match_found = false;
      for (let ref of missing_references) {
        if (ref.matches_path(node.full_path())) {
          match_found = true;
          ref.resolve_missing_dependencies();
        }
      }
      if (match_found) {
        this.references.delete(id);
      }
    });
  }
  _check_for_missing_references_for_param(param) {
    const id = param.graph_node_id;
    this.references.forEach((missing_references, node_id) => {
      let match_found = false;
      for (let ref of missing_references) {
        if (ref.matches_path(param.full_path())) {
          match_found = true;
          ref.resolve_missing_dependencies();
        }
      }
      if (match_found) {
        this.references.delete(id);
      }
    });
  }
}
