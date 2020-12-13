import {TypedEventNode} from "./_Base";
export const EVENT_PARAM_OPTIONS = {
  visible_if: {active: 1},
  callback: (node) => {
    BaseInputEventNodeClass.PARAM_CALLBACK_update_register(node);
  }
};
export class TypedInputEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this._active_event_names = [];
  }
  initialize_base_node() {
    super.initialize_base_node();
    const register = () => {
      this.scene.events_dispatcher.register_event_node(this);
    };
    const unregister = () => {
      this.scene.events_dispatcher.unregister_event_node(this);
    };
    this.lifecycle.add_on_add_hook(register);
    this.lifecycle.add_delete_hook(unregister);
    this.params.on_params_created("update_register", () => {
      this._update_register();
    });
  }
  process_event(event_context) {
    if (!this.pv.active) {
      return;
    }
    if (!event_context.event) {
      return;
    }
    this.dispatch_event_to_output(event_context.event.type, event_context);
  }
  static PARAM_CALLBACK_update_register(node) {
    node._update_register();
  }
  _update_register() {
    this._update_active_event_names();
    this.scene.events_dispatcher.update_viewer_event_listeners(this);
  }
  _update_active_event_names() {
    this._active_event_names = [];
    if (this.pv.active) {
      const list = this.accepted_event_types();
      for (let name of list) {
        const param = this.params.get(name);
        if (param && param.value) {
          this._active_event_names.push(name);
        }
      }
    }
  }
  active_event_names() {
    return this._active_event_names;
  }
}
export class BaseInputEventNodeClass extends TypedInputEventNode {
  accepted_event_types() {
    return [];
  }
}
