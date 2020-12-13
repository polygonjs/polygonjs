import lodash_isArray from "lodash/isArray";
import {TypedParam} from "./_Base";
import {FloatParam} from "./Float";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
export class TypedMultipleParam extends TypedParam {
  constructor() {
    super(...arguments);
    this._components_contructor = FloatParam;
  }
  get components() {
    return this._components;
  }
  get is_numeric() {
    return true;
  }
  get is_default() {
    for (let c of this.components) {
      if (!c.is_default) {
        return false;
      }
    }
    return true;
  }
  get raw_input() {
    return this._components.map((c) => c.raw_input);
  }
  get raw_input_serialized() {
    return this.raw_input;
  }
  _copy_value(param) {
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      const src_component = param.components[i];
      component.copy_value(src_component);
    }
  }
  init_components() {
    if (this._components != null) {
      return;
    }
    let index = 0;
    this._components = new Array(this.component_names.length);
    for (let component_name of this.component_names) {
      const component = new this._components_contructor(this.scene);
      let default_val;
      if (lodash_isArray(this._default_value)) {
        default_val = this._default_value[index];
      } else {
        default_val = this._default_value[component_name];
      }
      component.options.copy(this.options);
      component.set_init_value(default_val);
      component.set_name(`${this.name}${component_name}`);
      component.set_parent_param(this);
      this._components[index] = component;
      index++;
    }
  }
  async process_computation() {
    await this.compute_components();
    this.set_value_from_components();
  }
  set_value_from_components() {
  }
  has_expression() {
    for (let c of this.components) {
      if (c.expression_controller?.active) {
        return true;
      }
    }
    return false;
  }
  async compute_components() {
    const components = this.components;
    const promises = [];
    for (let c of components) {
      if (c.is_dirty) {
        promises.push(c.compute());
      }
    }
    await Promise.all(promises);
    this.remove_dirty_state();
  }
  _prefilter_invalid_raw_input(raw_input) {
    if (!lodash_isArray(raw_input)) {
      const number_or_string = raw_input;
      const raw_input_wrapped_in_array = this.component_names.map(() => number_or_string);
      return raw_input_wrapped_in_array;
    } else {
      return raw_input;
    }
  }
  process_raw_input() {
    const cooker = this.scene.cooker;
    cooker.block();
    const components = this.components;
    for (let c of components) {
      c.emit_controller.block_parent_emit();
    }
    const value = this._raw_input;
    let prev_value = 0;
    if (lodash_isArray(value)) {
      for (let i = 0; i < components.length; i++) {
        let component_value = value[i];
        if (component_value == null) {
          component_value = prev_value;
        }
        components[i].set(component_value);
        prev_value = component_value;
      }
    } else {
      for (let i = 0; i < components.length; i++) {
        const component_name = this.component_names[i];
        let component_value = value[component_name];
        if (component_value == null) {
          component_value = prev_value;
        }
        components[i].set(component_value);
        prev_value = component_value;
      }
    }
    cooker.unblock();
    for (let i = 0; i < components.length; i++) {
      components[i].emit_controller.unblock_parent_emit();
    }
    this.emit_controller.emit(ParamEvent2.VALUE_UPDATED);
  }
}
