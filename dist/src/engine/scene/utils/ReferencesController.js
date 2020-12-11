import {MapUtils as MapUtils2} from "../../../core/MapUtils";
import {ParamType as ParamType2} from "../../poly/ParamType";
import {OperatorPathParam} from "../../params/OperatorPath";
export class ReferencesController {
  constructor(scene) {
    this.scene = scene;
    this._referenced_nodes_by_src_param_id = new Map();
    this._referencing_params_by_referenced_node_id = new Map();
    this._referencing_params_by_all_named_node_ids = new Map();
  }
  set_reference_from_param(src_param, referenced_node) {
    this._referenced_nodes_by_src_param_id.set(src_param.graph_node_id, referenced_node);
    MapUtils2.push_on_array_at_entry(this._referencing_params_by_referenced_node_id, referenced_node.graph_node_id, src_param);
  }
  set_named_nodes_from_param(src_param) {
    const named_nodes = src_param.decomposed_path.named_nodes();
    for (let named_node of named_nodes) {
      MapUtils2.push_on_array_at_entry(this._referencing_params_by_all_named_node_ids, named_node.graph_node_id, src_param);
    }
  }
  reset_reference_from_param(src_param) {
    const referenced_node = this._referenced_nodes_by_src_param_id.get(src_param.graph_node_id);
    if (referenced_node) {
      MapUtils2.pop_from_array_at_entry(this._referencing_params_by_referenced_node_id, referenced_node.graph_node_id, src_param);
      const named_nodes = src_param.decomposed_path.named_nodes();
      for (let named_node of named_nodes) {
        MapUtils2.pop_from_array_at_entry(this._referencing_params_by_all_named_node_ids, named_node.graph_node_id, src_param);
      }
      this._referenced_nodes_by_src_param_id.delete(src_param.graph_node_id);
    }
  }
  referencing_params(node) {
    return this._referencing_params_by_referenced_node_id.get(node.graph_node_id);
  }
  referencing_nodes(node) {
    const params = this._referencing_params_by_referenced_node_id.get(node.graph_node_id);
    if (params) {
      const node_by_node_id = new Map();
      for (let param of params) {
        const node2 = param.node;
        node_by_node_id.set(node2.graph_node_id, node2);
      }
      const nodes = [];
      node_by_node_id.forEach((node2) => {
        nodes.push(node2);
      });
      return nodes;
    }
  }
  nodes_referenced_by(node) {
    const path_param_types = new Set([ParamType2.OPERATOR_PATH, ParamType2.NODE_PATH]);
    const path_params = [];
    for (let param of node.params.all) {
      if (path_param_types.has(param.type)) {
        path_params.push(param);
      }
    }
    const nodes_by_id = new Map();
    const params = [];
    for (let path_param of path_params) {
      this._check_param(path_param, nodes_by_id, params);
    }
    for (let param of params) {
      nodes_by_id.set(param.node.graph_node_id, param.node);
    }
    const nodes = [];
    nodes_by_id.forEach((node2) => {
      nodes.push(node2);
    });
    return nodes;
  }
  _check_param(param, nodes_by_id, params) {
    if (param instanceof OperatorPathParam) {
      const found_node = param.found_node();
      const found_param = param.found_param();
      if (found_node) {
        nodes_by_id.set(found_node.graph_node_id, found_node);
      }
      if (found_param) {
        params.push(found_param);
      }
      return;
    }
  }
  notify_name_updated(node) {
    const referencing_params = this._referencing_params_by_all_named_node_ids.get(node.graph_node_id);
    if (referencing_params) {
      for (let referencing_param of referencing_params) {
        referencing_param.notify_path_rebuild_required(node);
      }
    }
  }
  notify_params_updated(node) {
    const referencing_params = this._referencing_params_by_all_named_node_ids.get(node.graph_node_id);
    if (referencing_params) {
      for (let referencing_param of referencing_params) {
        if (referencing_param.options.is_selecting_param()) {
          referencing_param.notify_target_param_owner_params_updated(node);
        }
      }
    }
  }
}
