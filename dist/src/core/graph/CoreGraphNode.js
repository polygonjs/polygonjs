import {DirtyController as DirtyController2} from "./DirtyController";
export class CoreGraphNode {
  constructor(_scene, _name) {
    this._scene = _scene;
    this._name = _name;
    this._dirty_controller = new DirtyController2(this);
    this._graph_node_id = _scene.graph.next_id();
    _scene.graph.add_node(this);
    this._graph = _scene.graph;
  }
  get name() {
    return this._name;
  }
  set_name(name) {
    this._name = name;
  }
  get scene() {
    return this._scene;
  }
  get graph() {
    return this._graph;
  }
  get graph_node_id() {
    return this._graph_node_id;
  }
  get dirty_controller() {
    return this._dirty_controller;
  }
  set_dirty(trigger) {
    trigger = trigger || this;
    this._dirty_controller.set_dirty(trigger);
  }
  set_successors_dirty(trigger) {
    this._dirty_controller.set_successors_dirty(trigger);
  }
  remove_dirty_state() {
    this._dirty_controller.remove_dirty_state();
  }
  get is_dirty() {
    return this._dirty_controller.is_dirty;
  }
  add_post_dirty_hook(name, callback) {
    this._dirty_controller.add_post_dirty_hook(name, callback);
  }
  graph_remove() {
    this.graph.remove_node(this);
  }
  add_graph_input(src, check_if_graph_has_cycle = true) {
    return this.graph.connect(src, this, check_if_graph_has_cycle);
  }
  remove_graph_input(src) {
    this.graph.disconnect(src, this);
  }
  graph_disconnect_predecessors() {
    this.graph.disconnect_predecessors(this);
  }
  graph_disconnect_successors() {
    this.graph.disconnect_successors(this);
  }
  graph_predecessor_ids() {
    return this.graph.predecessor_ids(this._graph_node_id) || [];
  }
  graph_predecessors() {
    return this.graph.predecessors(this);
  }
  graph_successors() {
    return this.graph.successors(this);
  }
  graph_all_predecessors() {
    return this.graph.all_predecessors(this);
  }
  graph_all_successors() {
    return this.graph.all_successors(this);
  }
}
