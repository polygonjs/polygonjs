export class CoreGraph {
  constructor() {
    this._next_id = 0;
    this._successors = new Map();
    this._predecessors = new Map();
    this._nodes_by_id = new Map();
  }
  set_scene(scene) {
    this._scene = scene;
  }
  scene() {
    return this._scene;
  }
  next_id() {
    this._next_id += 1;
    return this._next_id;
  }
  nodes_from_ids(ids) {
    const nodes = [];
    for (let id of ids) {
      const node = this.node_from_id(id);
      if (node) {
        nodes.push(node);
      }
    }
    return nodes;
  }
  node_from_id(id) {
    return this._nodes_by_id.get(id);
  }
  has_node(node) {
    return this._nodes_by_id.get(node.graph_node_id) != null;
  }
  add_node(node) {
    this._nodes_by_id.set(node.graph_node_id, node);
  }
  remove_node(node) {
    this._nodes_by_id.delete(node.graph_node_id);
    this._successors.delete(node.graph_node_id);
    this._predecessors.delete(node.graph_node_id);
  }
  connect(src, dest, check_if_graph_may_have_cycle = true) {
    const src_id = src.graph_node_id;
    const dest_id = dest.graph_node_id;
    if (this.has_node(src) && this.has_node(dest)) {
      if (check_if_graph_may_have_cycle) {
        const scene_loading = this._scene ? this._scene.loading_controller.is_loading : true;
        check_if_graph_may_have_cycle = !scene_loading;
      }
      let graph_would_have_cycle = false;
      if (check_if_graph_may_have_cycle) {
        graph_would_have_cycle = this._has_predecessor(src_id, dest_id);
      }
      if (graph_would_have_cycle) {
        return false;
      } else {
        this._create_connection(src_id, dest_id);
        src.dirty_controller.clear_successors_cache_with_predecessors();
        return true;
      }
    } else {
      console.warn(`attempt to connect non existing node ${src_id} or ${dest_id}`);
      return false;
    }
  }
  disconnect(src, dest) {
    this._remove_connection(src.graph_node_id, dest.graph_node_id);
    src.dirty_controller.clear_successors_cache_with_predecessors();
  }
  disconnect_predecessors(node) {
    const predecessors = this.predecessors(node);
    for (let predecessor of predecessors) {
      this.disconnect(predecessor, node);
    }
  }
  disconnect_successors(node) {
    const successors = this.successors(node);
    for (let successor of successors) {
      this.disconnect(node, successor);
    }
  }
  predecessor_ids(id) {
    const map = this._predecessors.get(id);
    if (map) {
      const ids = [];
      map.forEach((bool, id2) => {
        ids.push(id2);
      });
      return ids;
    }
    return [];
  }
  predecessors(node) {
    const ids = this.predecessor_ids(node.graph_node_id);
    return this.nodes_from_ids(ids);
  }
  successor_ids(id) {
    const map = this._successors.get(id);
    if (map) {
      const ids = [];
      map.forEach((bool, id2) => {
        ids.push(id2);
      });
      return ids;
    }
    return [];
  }
  successors(node) {
    const ids = this.successor_ids(node.graph_node_id) || [];
    return this.nodes_from_ids(ids);
  }
  all_predecessor_ids(node) {
    return this.all_next_ids(node, "predecessor_ids");
  }
  all_successor_ids(node) {
    return this.all_next_ids(node, "successor_ids");
  }
  all_predecessors(node) {
    const ids = this.all_predecessor_ids(node);
    return this.nodes_from_ids(ids);
  }
  all_successors(node) {
    const ids = this.all_successor_ids(node);
    return this.nodes_from_ids(ids);
  }
  _create_connection(src_id, dest_id) {
    let node_successors = this._successors.get(src_id);
    if (!node_successors) {
      node_successors = new Set();
      this._successors.set(src_id, node_successors);
    }
    if (node_successors.has(dest_id)) {
      return;
    }
    node_successors.add(dest_id);
    let node_predecessors = this._predecessors.get(dest_id);
    if (!node_predecessors) {
      node_predecessors = new Set();
      this._predecessors.set(dest_id, node_predecessors);
    }
    node_predecessors.add(src_id);
  }
  _remove_connection(src_id, dest_id) {
    let node_successors = this._successors.get(src_id);
    if (node_successors) {
      node_successors.delete(dest_id);
      if (node_successors.size == 0) {
        this._successors.delete(src_id);
      }
    }
    let node_predecessors = this._predecessors.get(dest_id);
    if (node_predecessors) {
      node_predecessors.delete(src_id);
      if (node_predecessors.size == 0) {
        this._predecessors.delete(dest_id);
      }
    }
  }
  all_next_ids(node, method) {
    const ids_by_id = new Map();
    const ids = [];
    let next_ids = this[method](node.graph_node_id);
    while (next_ids.length > 0) {
      const next_next_ids = [];
      for (let next_id of next_ids) {
        for (let next_next_id of this[method](next_id)) {
          next_next_ids.push(next_next_id);
        }
      }
      for (let id of next_ids) {
        ids_by_id.set(id, true);
      }
      for (let id of next_next_ids) {
        next_ids.push(id);
      }
      next_ids = next_next_ids;
    }
    ids_by_id.forEach((bool, id) => {
      ids.push(id);
    });
    return ids;
  }
  _has_predecessor(src_id, dest_id) {
    const ids = this.predecessor_ids(src_id);
    if (ids) {
      if (ids.includes(dest_id)) {
        return true;
      } else {
        for (let id of ids) {
          return this._has_predecessor(id, dest_id);
        }
      }
    }
    return false;
  }
}
