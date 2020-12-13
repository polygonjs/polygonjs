export class CookController {
  constructor() {
    this._cooking_nodes_by_id = new Map();
    this._resolves = [];
  }
  add_node(node) {
    this._cooking_nodes_by_id.set(node.graph_node_id, node);
  }
  remove_node(node) {
    this._cooking_nodes_by_id.delete(node.graph_node_id);
    if (this._cooking_nodes_by_id.size == 0) {
      this.flush();
    }
  }
  flush() {
    let callback;
    while (callback = this._resolves.pop()) {
      callback();
    }
  }
  async wait_for_cooks_completed() {
    if (this._cooking_nodes_by_id.size == 0) {
      return;
    } else {
      return new Promise((resolve, reject) => {
        this._resolves.push(resolve);
      });
    }
  }
}
