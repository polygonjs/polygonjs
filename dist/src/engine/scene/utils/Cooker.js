export class Cooker {
  constructor(_scene) {
    this._scene = _scene;
    this._queue = new Map();
    this._block_level = 0;
    this._process_item_bound = this._process_item.bind(this);
    this._block_level = 0;
  }
  block() {
    this._block_level += 1;
  }
  unblock() {
    this._block_level -= 1;
    if (this._block_level < 0) {
      this._block_level = 0;
    }
    this.process_queue();
  }
  get blocked() {
    return this._block_level > 0;
  }
  enqueue(node, original_trigger_graph_node) {
    this._queue.set(node.graph_node_id, original_trigger_graph_node);
  }
  process_queue() {
    if (this.blocked) {
      return;
    }
    this._queue.forEach(this._process_item_bound);
  }
  _process_item(original_trigger_graph_node, id) {
    const node = this._scene.graph.node_from_id(id);
    if (node) {
      this._queue.delete(id);
      node.dirty_controller.run_post_dirty_hooks(original_trigger_graph_node);
    }
  }
}
