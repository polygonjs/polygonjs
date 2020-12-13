export class BaseSceneEventsController {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this._nodes_by_graph_node_id = new Map();
    this._require_canvas_event_listeners = false;
    this._active_event_types = [];
  }
  register_node(node) {
    this._nodes_by_graph_node_id.set(node.graph_node_id, node);
    this.update_viewer_event_listeners();
  }
  unregister_node(node) {
    this._nodes_by_graph_node_id.delete(node.graph_node_id);
    this.update_viewer_event_listeners();
  }
  process_event(event_context) {
    if (this._active_event_types.length == 0) {
      return;
    }
    this._nodes_by_graph_node_id.forEach((node) => node.process_event(event_context));
  }
  update_viewer_event_listeners() {
    this._update_active_event_types();
    if (this._require_canvas_event_listeners) {
      this.dispatcher.scene.viewers_register.traverse_viewers((viewer) => {
        viewer.events_controller.update_events(this);
      });
    }
  }
  active_event_types() {
    return this._active_event_types;
  }
  _update_active_event_types() {
    const active_node_event_types_state = new Map();
    this._nodes_by_graph_node_id.forEach((node) => {
      if (node.parent) {
        const node_active_event_names = node.active_event_names();
        for (let name of node_active_event_names) {
          active_node_event_types_state.set(name, true);
        }
      }
    });
    this._active_event_types = [];
    active_node_event_types_state.forEach((state, name) => {
      this._active_event_types.push(name);
    });
  }
}
export class BaseSceneEventsControllerClass extends BaseSceneEventsController {
  type() {
    return "";
  }
  accepted_event_types() {
    return [];
  }
}
