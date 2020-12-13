import lodash_difference from "lodash/difference";
import lodash_union from "lodash/union";
import lodash_isEqual from "lodash/isEqual";
import {NodeEvent as NodeEvent2} from "../engine/poly/NodeEvent";
export class CoreNodeSelection {
  constructor(_node) {
    this._node = _node;
    this._node_ids = [];
    this._json = [];
  }
  node() {
    return this._node;
  }
  nodes() {
    return this._node.scene.graph.nodes_from_ids(this._node_ids);
  }
  contains(node) {
    return this._node_ids.includes(node.graph_node_id);
  }
  equals(nodes) {
    const node_ids = nodes.map((node) => node.graph_node_id).sort();
    return lodash_isEqual(node_ids, this._node_ids);
  }
  clear() {
    this._node_ids = [];
    this.send_update_event();
  }
  set(nodes) {
    this._node_ids = [];
    this.add(nodes);
  }
  add(nodes_to_add) {
    const node_ids_to_add = nodes_to_add.map((node) => node.graph_node_id);
    this._node_ids = lodash_union(this._node_ids, node_ids_to_add);
    this.send_update_event();
  }
  remove(nodes_to_remove) {
    const node_ids_to_remove = nodes_to_remove.map((node) => node.graph_node_id);
    this._node_ids = lodash_difference(this._node_ids, node_ids_to_remove);
    this.send_update_event();
  }
  send_update_event() {
    this._node.emit(NodeEvent2.SELECTION_UPDATED);
  }
  to_json() {
    this._json = this._json || [];
    this._json = this._node_ids.map((id) => id);
    return this._json;
  }
}
