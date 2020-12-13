import lodash_isString from "lodash/isString";
import {TypedParam} from "./_Base";
import {ParsedTree as ParsedTree2} from "../expressions/traversers/ParsedTree";
import {ParamType as ParamType2} from "../poly/ParamType";
import {ExpressionController as ExpressionController2} from "./utils/ExpressionController";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
export class StringParam extends TypedParam {
  static type() {
    return ParamType2.STRING;
  }
  get default_value_serialized() {
    return this.default_value;
  }
  _clone_raw_input(raw_input) {
    return `${raw_input}`;
  }
  get raw_input_serialized() {
    return `${this._raw_input}`;
  }
  get value_serialized() {
    return `${this.value}`;
  }
  _copy_value(param) {
    this.set(param.value);
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
  convert(raw_val) {
    if (lodash_isString(raw_val)) {
      return raw_val;
    }
    return `${raw_val}`;
  }
  get raw_input() {
    return this._raw_input;
  }
  process_raw_input() {
    this.states.error.clear();
    if (this._value_elements(this._raw_input).length >= 3) {
      this._expression_controller = this._expression_controller || new ExpressionController2(this);
      if (this._raw_input != this._expression_controller.expression) {
        this._expression_controller.set_expression(this._raw_input);
        this.set_dirty();
        this.emit_controller.emit(ParamEvent2.EXPRESSION_UPDATED);
      }
    } else {
      if (this._raw_input != this._value) {
        this._value = this._raw_input;
        this.remove_dirty_state();
        this.set_successors_dirty(this);
        this.emit_controller.emit(ParamEvent2.VALUE_UPDATED);
        this.options.execute_callback();
        if (this._expression_controller) {
          this._expression_controller.set_expression(void 0, false);
          this.emit_controller.emit(ParamEvent2.EXPRESSION_UPDATED);
        }
      }
    }
  }
  async process_computation() {
    if (this.expression_controller?.active && !this.expression_controller.requires_entities) {
      const expression_result = await this.expression_controller.compute_expression();
      if (this.expression_controller.is_errored) {
        this.states.error.set(`expression error: ${this.expression_controller.error_message}`);
      } else {
        const converted = this.convert(expression_result);
        if (converted != null) {
          this._value = converted;
          this.emit_controller.emit(ParamEvent2.VALUE_UPDATED);
          this.options.execute_callback();
        } else {
          this.states.error.set(`expression returns an invalid type (${expression_result})`);
        }
        this.remove_dirty_state();
      }
    }
  }
  _value_elements(v) {
    return ParsedTree2.string_value_elements(v);
  }
}
