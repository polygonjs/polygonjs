import {TypedParam} from "./_Base";
import {CoreWalker} from "../../core/Walker";
import {ParamType as ParamType2} from "../poly/ParamType";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
import {DecomposedPath as DecomposedPath2} from "../../core/DecomposedPath";
import {TypedPathParamValue} from "../../core/Walker";
export const NODE_PATH_DEFAULT = {
  NODE: {
    UV: "/COP/file_uv",
    ENV_MAP: "/COP/env_map"
  }
};
export class NodePathParam extends TypedParam {
  constructor() {
    super(...arguments);
    this._found_node = null;
    this.decomposed_path = new DecomposedPath2();
  }
  static type() {
    return ParamType2.NODE_PATH;
  }
  initialize_param() {
    this._value = new TypedPathParamValue();
  }
  get default_value_serialized() {
    return this.default_value;
  }
  get raw_input_serialized() {
    return `${this._raw_input}`;
  }
  get value_serialized() {
    return `${this.value}`;
  }
  _copy_value(param) {
    this.set(param.value_serialized);
  }
  static are_raw_input_equal(raw_input1, raw_input2) {
    return raw_input1 == raw_input2;
  }
  static are_values_equal(val1, val2) {
    return val1 == val2;
  }
  get is_default() {
    return this._raw_input == this.default_value;
  }
  process_raw_input() {
    if (this._value.path() != this._raw_input) {
      this._value.set_path(this._raw_input);
      this.find_target();
      this.set_dirty();
      this.emit_controller.emit(ParamEvent2.VALUE_UPDATED);
    }
  }
  async process_computation() {
    this.find_target();
  }
  find_target() {
    if (!this.node) {
      return;
    }
    const path = this._raw_input;
    let node = null;
    const path_non_empty = path != null && path !== "";
    this.scene.references_controller.reset_reference_from_param(this);
    this.decomposed_path.reset();
    if (path_non_empty) {
      node = CoreWalker.find_node(this.node, path, this.decomposed_path);
    }
    const current_found_entity = this._found_node;
    const newly_found_entity = node;
    this.scene.references_controller.set_named_nodes_from_param(this);
    if (node) {
      this.scene.references_controller.set_reference_from_param(this, node);
    }
    if (current_found_entity?.graph_node_id !== newly_found_entity?.graph_node_id) {
      const dependent_on_found_node = this.options.dependent_on_found_node();
      const previously_found_node = this._value.node();
      if (previously_found_node) {
        if (dependent_on_found_node) {
          this.remove_graph_input(previously_found_node);
        } else {
        }
      }
      this._value.set_node(node);
      this.options.execute_callback();
    }
    this.remove_dirty_state();
  }
  notify_path_rebuild_required(node) {
    this.decomposed_path.update_from_name_change(node);
    const new_path = this.decomposed_path.to_path();
    this.set(new_path);
  }
  notify_target_param_owner_params_updated(node) {
    this.set_dirty();
  }
}
