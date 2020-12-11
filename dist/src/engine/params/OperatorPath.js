import {TypedPathParam} from "./_BasePath";
import {CoreWalker} from "../../core/Walker";
import lodash_isArray from "lodash/isArray";
import {ParamType as ParamType2} from "../poly/ParamType";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
var OperatorPathMode;
(function(OperatorPathMode2) {
  OperatorPathMode2["NODE"] = "NODE";
  OperatorPathMode2["PARAM"] = "PARAM";
})(OperatorPathMode || (OperatorPathMode = {}));
export const OPERATOR_PATH_DEFAULT = {
  NODE: {
    UV: "/COP/image_uv",
    ENV_MAP: "/COP/env_map"
  }
};
export class OperatorPathParam extends TypedPathParam {
  constructor() {
    super(...arguments);
    this._found_node = null;
    this._found_node_with_expected_type = null;
    this._found_param = null;
    this._found_param_with_expected_type = null;
  }
  static type() {
    return ParamType2.OPERATOR_PATH;
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
    return this._value == this.default_value;
  }
  process_raw_input() {
    if (this._value != this._raw_input) {
      this._value = this._raw_input;
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
    const path = this._value;
    let node = null;
    let param = null;
    const path_non_empty = path != null && path !== "";
    const mode = this.options.param_selection_options ? OperatorPathMode.PARAM : OperatorPathMode.NODE;
    this.scene.references_controller.reset_reference_from_param(this);
    this.decomposed_path.reset();
    if (path_non_empty) {
      if (mode == OperatorPathMode.PARAM) {
        param = CoreWalker.find_param(this.node, path, this.decomposed_path);
      } else {
        node = CoreWalker.find_node(this.node, path, this.decomposed_path);
      }
    }
    const current_found_entity = mode == OperatorPathMode.PARAM ? this._found_param : this._found_node;
    const newly_found_entity = mode == OperatorPathMode.PARAM ? param : node;
    this.scene.references_controller.set_named_nodes_from_param(this);
    if (node) {
      this.scene.references_controller.set_reference_from_param(this, node);
    }
    if (current_found_entity?.graph_node_id !== newly_found_entity?.graph_node_id) {
      const dependent_on_found_node = this.options.dependent_on_found_node();
      if (this._found_node) {
        if (dependent_on_found_node) {
          this.remove_graph_input(this._found_node);
        } else {
        }
      }
      if (mode == OperatorPathMode.PARAM) {
        this._found_param = param;
        this._found_node = null;
      } else {
        this._found_node = node;
        this._found_param = null;
      }
      if (node) {
        this._assign_found_node(node);
      }
      if (param) {
        this._assign_found_param(param);
      }
      this.options.execute_callback();
    }
    this.remove_dirty_state();
  }
  _assign_found_node(node) {
    const dependent_on_found_node = this.options.dependent_on_found_node();
    if (this._is_node_expected_context(node)) {
      if (this._is_node_expected_type(node)) {
        this._found_node_with_expected_type = node;
        if (dependent_on_found_node) {
          this.add_graph_input(node);
        }
      } else {
        this.states.error.set(`node type is ${node.type} but the params expects one of ${(this._expected_node_types() || []).join(", ")}`);
      }
    } else {
      this.states.error.set(`node context is ${node.node_context()} but the params expects a ${this._expected_context()}`);
    }
  }
  _assign_found_param(param) {
    if (this._is_param_expected_type(param)) {
      this._found_param_with_expected_type = param;
    } else {
      this.states.error.set(`param type is ${param.type} but the params expects a ${this._expected_param_type()}`);
    }
  }
  found_node() {
    return this._found_node;
  }
  found_param() {
    return this._found_param;
  }
  found_node_with_context(context) {
    return this._found_node_with_expected_type;
  }
  found_node_with_context_and_type(context, type_or_types) {
    const node = this.found_node_with_context(context);
    if (node) {
      if (lodash_isArray(type_or_types)) {
        for (let type of type_or_types) {
          if (node.type == type) {
            return node;
          }
        }
        this.states.error.set(`expected node type to be ${type_or_types.join(", ")}, but was instead ${node.type}`);
      } else {
        const type = type_or_types;
        if (node.type == type) {
          return node;
        } else {
          this.states.error.set(`expected node type to be ${type}, but was instead ${node.type}`);
        }
      }
    }
  }
  found_param_with_type(type) {
    if (this._found_param_with_expected_type) {
      return this._found_param_with_expected_type;
    }
  }
  found_node_with_expected_type() {
    return this._found_node_with_expected_type;
  }
  _expected_context() {
    return this.options.node_selection_context;
  }
  _is_node_expected_context(node) {
    const expected_context = this._expected_context();
    if (expected_context == null) {
      return true;
    }
    const node_context = node.parent?.children_controller?.context;
    return expected_context == node_context;
  }
  _expected_node_types() {
    return this.options.node_selection_types;
  }
  _expected_param_type() {
    return this.options.param_selection_type;
  }
  _is_node_expected_type(node) {
    const expected_types = this._expected_node_types();
    if (expected_types == null) {
      return true;
    }
    return expected_types?.includes(node.type);
  }
  _is_param_expected_type(param) {
    const expected_types = this._expected_node_types();
    if (expected_types == null) {
      return true;
    }
    return expected_types.includes(param.type);
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
