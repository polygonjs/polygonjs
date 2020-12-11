import lodash_concat from "lodash/concat";
import lodash_flatten from "lodash/flatten";
import lodash_compact from "lodash/compact";
import {ObjectsManagerNode} from "../../nodes/manager/ObjectsManager";
import {CoreString} from "../../../core/String";
export class NodesController {
  constructor(scene) {
    this.scene = scene;
    this._node_context_signatures = {};
    this._instanciated_nodes_by_context_and_type = {};
  }
  init() {
    this._root = new ObjectsManagerNode(this.scene);
    this._root.initialize_base_and_node();
    this._root.init_default_scene();
  }
  get root() {
    return this._root;
  }
  objects_from_mask(mask) {
    const masks = mask.split(" ");
    let nodes = this.root.children();
    nodes = nodes.filter((node) => CoreString.matches_one_mask(node.name, masks));
    const objects = nodes.map((geo) => geo.object);
    return lodash_compact(objects);
  }
  clear() {
    const children = this.root.children();
    for (let child of children) {
      this.root.children_controller?.remove_node(child);
    }
  }
  node(path) {
    if (path === "/") {
      return this.root;
    } else {
      return this.root.node(path);
    }
  }
  all_nodes() {
    let nodes = [this.root];
    let current_parents = [this.root];
    let cmptr = 0;
    while (current_parents.length > 0 && cmptr < 10) {
      const children = lodash_flatten(current_parents.map((current_parent) => {
        if (current_parent.children_allowed()) {
          return current_parent.children();
        } else {
          return [];
        }
      }));
      nodes = lodash_concat(nodes, children);
      current_parents = children;
      cmptr += 1;
    }
    return lodash_flatten(nodes);
  }
  nodes_from_mask(mask) {
    const nodes = this.all_nodes();
    const matching_nodes = [];
    for (let node of nodes) {
      const path = node.full_path();
      if (CoreString.match_mask(path, mask)) {
        matching_nodes.push(node);
      }
    }
    return matching_nodes;
  }
  reset_node_context_signatures() {
    this._node_context_signatures = {};
  }
  register_node_context_signature(node) {
    if (node.children_allowed() && node.children_controller) {
      this._node_context_signatures[node.children_controller.node_context_signature()] = true;
    }
  }
  node_context_signatures() {
    return Object.keys(this._node_context_signatures).sort().map((s) => s.toLowerCase());
  }
  add_to_instanciated_node(node) {
    const context = node.node_context();
    const node_type = node.type;
    this._instanciated_nodes_by_context_and_type[context] = this._instanciated_nodes_by_context_and_type[context] || {};
    this._instanciated_nodes_by_context_and_type[context][node_type] = this._instanciated_nodes_by_context_and_type[context][node_type] || {};
    this._instanciated_nodes_by_context_and_type[context][node_type][node.graph_node_id] = node;
  }
  remove_from_instanciated_node(node) {
    const context = node.node_context();
    const node_type = node.type;
    delete this._instanciated_nodes_by_context_and_type[context][node_type][node.graph_node_id];
  }
  instanciated_nodes(context, node_type) {
    const nodes = [];
    const nodes_for_context = this._instanciated_nodes_by_context_and_type[context];
    if (nodes_for_context) {
      const nodes_by_ids = nodes_for_context[node_type];
      if (nodes_by_ids) {
        for (let id of Object.keys(nodes_by_ids)) {
          nodes.push(nodes_by_ids[id]);
        }
      }
    }
    return nodes;
  }
}
