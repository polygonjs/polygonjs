import {SceneEventType} from "./events/SceneEventsController";
export class LoadingController {
  constructor(scene) {
    this.scene = scene;
    this._loading_state = true;
    this._auto_updating = true;
    this._first_object_loaded = false;
  }
  get LOADED_EVENT_CONTEXT() {
    return this._LOADED_EVENT_CONTEXT = this._LOADED_EVENT_CONTEXT || {event: new Event(SceneEventType.LOADED)};
  }
  mark_as_loading() {
    this._set_loading_state(true);
  }
  async mark_as_loaded() {
    this.scene.missing_expression_references_controller.resolve_missing_references();
    await this._set_loading_state(false);
    this.trigger_loaded_event();
  }
  trigger_loaded_event() {
    if (globalThis.Event) {
      this.scene.events_dispatcher.scene_events_controller.process_event(this.LOADED_EVENT_CONTEXT);
    }
  }
  async _set_loading_state(state) {
    this._loading_state = state;
    await this.set_auto_update(!this._loading_state);
  }
  get is_loading() {
    return this._loading_state;
  }
  get loaded() {
    return !this._loading_state;
  }
  get auto_updating() {
    return this._auto_updating;
  }
  async set_auto_update(new_state) {
    if (this._auto_updating !== new_state) {
      this._auto_updating = new_state;
      if (this._auto_updating) {
        const root = this.scene.root;
        if (root) {
          await root.process_queue();
        }
      }
    }
  }
  on_first_object_loaded() {
    if (!this._first_object_loaded) {
      this._first_object_loaded = true;
      const loader = document.getElementById("scene_loading_container");
      if (loader) {
        loader.parentElement?.removeChild(loader);
      }
    }
  }
}
