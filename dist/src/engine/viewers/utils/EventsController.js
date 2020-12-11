export class ViewerEventsController {
  constructor(viewer) {
    this.viewer = viewer;
    this._bound_process_event = this.process_event.bind(this);
    this._bound_listener_map_by_event_controller_type = new Map();
  }
  update_events(events_controller) {
    if (!this.canvas) {
      return;
    }
    const controller_type = events_controller.type();
    let map = this._bound_listener_map_by_event_controller_type.get(controller_type);
    if (!map) {
      map = new Map();
      this._bound_listener_map_by_event_controller_type.set(controller_type, map);
    }
    map.forEach((listener2, event_type) => {
      this.canvas?.removeEventListener(event_type, listener2);
    });
    map.clear();
    const listener = (event) => {
      this.process_event(event, events_controller);
    };
    for (let event_type of events_controller.active_event_types()) {
      this.canvas.addEventListener(event_type, listener);
      map.set(event_type, listener);
    }
  }
  get camera_node() {
    return this.viewer.cameras_controller.camera_node;
  }
  get canvas() {
    return this.viewer.canvas;
  }
  init() {
    if (!this.canvas) {
      return;
    }
    this.viewer.scene.events_dispatcher.traverse_controllers((controller) => {
      this.update_events(controller);
    });
  }
  registered_event_types() {
    const list = [];
    this._bound_listener_map_by_event_controller_type.forEach((map) => {
      map.forEach((listener, event_type) => {
        list.push(event_type);
      });
    });
    return list;
  }
  dispose() {
    this._bound_listener_map_by_event_controller_type.forEach((map) => {
      map.forEach((listener, event_type) => {
        this.canvas?.removeEventListener(event_type, listener);
      });
    });
  }
  process_event(event, controller) {
    if (!this.canvas) {
      return;
    }
    const event_context = {
      event,
      canvas: this.canvas,
      camera_node: this.camera_node
    };
    controller.process_event(event_context);
  }
}
