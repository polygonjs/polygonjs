import {CoreWalker} from "../../core/Walker";
import {CoreGraphNode as CoreGraphNode2} from "../../core/graph/CoreGraphNode";
import {OptionsController as OptionsController2} from "./utils/OptionsController";
import {EmitController as EmitController2} from "./utils/EmitController";
import {ParamSerializer} from "./utils/Serializer";
import {StatesController as StatesController2} from "./utils/StatesController";
import {ParamType as ParamType2} from "../poly/ParamType";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
const TYPED_PARAM_DEFAULT_COMPONENT_NAMES = [];
export class TypedParam extends CoreGraphNode2 {
  constructor(scene) {
    super(scene, "BaseParam");
    this._options = new OptionsController2(this);
    this._emit_controller = new EmitController2(this);
    this._is_computing = false;
    this.initialize_param();
  }
  get options() {
    return this._options = this._options || new OptionsController2(this);
  }
  get emit_controller() {
    return this._emit_controller = this._emit_controller || new EmitController2(this);
  }
  get expression_controller() {
    return this._expression_controller;
  }
  get serializer() {
    return this._serializer = this._serializer || new ParamSerializer(this);
  }
  get states() {
    return this._states = this._states || new StatesController2(this);
  }
  initialize_param() {
  }
  static type() {
    return ParamType2.FLOAT;
  }
  get type() {
    return this.constructor.type();
  }
  get is_numeric() {
    return false;
  }
  set_name(name) {
    super.set_name(name);
  }
  get value() {
    return this._value;
  }
  copy_value(param) {
    if (param.type == this.type) {
      this._copy_value(param);
    } else {
      console.warn(`cannot copy value from ${param.type} to ${this.type}`);
    }
  }
  _copy_value(param) {
    throw "abstract method param._copy_value";
  }
  get value_pre_conversion_serialized() {
    return void 0;
  }
  convert(raw_val) {
    return null;
  }
  static are_raw_input_equal(val1, val2) {
    return false;
  }
  is_raw_input_equal(other_raw_input) {
    return this.constructor.are_raw_input_equal(this._raw_input, other_raw_input);
  }
  static are_values_equal(val1, val2) {
    return false;
  }
  is_value_equal(other_val) {
    return this.constructor.are_values_equal(this.value, other_val);
  }
  _clone_raw_input(raw_input) {
    return raw_input;
  }
  set(raw_input) {
    this._raw_input = this._clone_raw_input(this._prefilter_invalid_raw_input(raw_input));
    this.emit_controller.emit(ParamEvent2.RAW_INPUT_UPDATED);
    this.process_raw_input();
  }
  _prefilter_invalid_raw_input(raw_input) {
    return raw_input;
  }
  get default_value() {
    return this._default_value;
  }
  get is_default() {
    return this._raw_input == this.default_value;
  }
  get raw_input() {
    return this._raw_input;
  }
  process_raw_input() {
  }
  async compute() {
    if (this.scene.loading_controller.is_loading) {
      console.warn(`param attempt to compute ${this.full_path()}`);
    }
    if (this.is_dirty) {
      if (!this._is_computing) {
        this._is_computing = true;
        await this.process_computation();
        this._is_computing = false;
        if (this._compute_resolves) {
          let callback;
          while (callback = this._compute_resolves.pop()) {
            callback();
          }
        }
      } else {
        return new Promise((resolve, reject) => {
          this._compute_resolves = this._compute_resolves || [];
          this._compute_resolves.push(resolve);
        });
      }
    }
  }
  async process_computation() {
  }
  set_init_value(init_value) {
    this._default_value = this._clone_raw_input(this._prefilter_invalid_raw_input(init_value));
  }
  set_node(node) {
    if (!node) {
      if (this._node) {
        this._node.params.params_node?.remove_graph_input(this);
      }
    } else {
      this._node = node;
      if (this.options.makes_node_dirty_when_dirty() && !this.parent_param) {
        node.params.params_node?.add_graph_input(this, false);
      }
    }
    if (this.components) {
      for (let c of this.components) {
        c.set_node(node);
      }
    }
  }
  get node() {
    return this._node;
  }
  get parent() {
    return this.node;
  }
  set_parent_param(param) {
    param.add_graph_input(this, false);
    this._parent_param = param;
  }
  get parent_param() {
    return this._parent_param;
  }
  has_parent_param() {
    return this._parent_param != null;
  }
  full_path() {
    return this.node?.full_path() + "/" + this.name;
  }
  path_relative_to(node) {
    return CoreWalker.relative_path(node, this);
  }
  emit(event_name) {
    if (this.emit_controller.emit_allowed) {
      this.emit_controller.increment_count(event_name);
      this.scene.dispatch_controller.dispatch(this, event_name);
    }
  }
  get components() {
    return this._components;
  }
  get component_names() {
    return TYPED_PARAM_DEFAULT_COMPONENT_NAMES;
  }
  get is_multiple() {
    return this.component_names.length > 0;
  }
  init_components() {
  }
  has_expression() {
    return this.expression_controller != null && this.expression_controller.active;
  }
  to_json() {
    return this.serializer.to_json();
  }
}
export class BaseParamClass extends TypedParam {
  get default_value_serialized() {
    return "BaseParamClass.default_value_serialized overriden";
  }
  get raw_input_serialized() {
    return "BaseParamClass.raw_input_serialized overriden";
  }
  get value_serialized() {
    return "BaseParamClass.value_serialized overriden";
  }
}
