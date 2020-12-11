import "../../Poly";
export class DispatchController {
  constructor(scene) {
    this.scene = scene;
  }
  set_listener(events_listener) {
    if (!this._events_listener) {
      this._events_listener = events_listener;
      this.run_on_add_listener_callbacks();
    } else {
      console.warn("scene already has a listener");
    }
  }
  on_add_listener(callback) {
    if (this._events_listener) {
      callback();
    } else {
      this._on_add_listener_callbacks = this._on_add_listener_callbacks || [];
      this._on_add_listener_callbacks.push(callback);
    }
  }
  run_on_add_listener_callbacks() {
    if (this._on_add_listener_callbacks) {
      let callback;
      while (callback = this._on_add_listener_callbacks.pop()) {
        callback();
      }
      this._on_add_listener_callbacks = void 0;
    }
  }
  get events_listener() {
    return this._events_listener;
  }
  dispatch(emitter, event_name, data) {
    this._events_listener?.process_events(emitter, event_name, data);
  }
  get emit_allowed() {
    return this._events_listener != null && this.scene.loading_controller.loaded && this.scene.loading_controller.auto_updating;
  }
}
