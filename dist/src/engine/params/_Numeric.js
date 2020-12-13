import lodash_isString from "lodash/isString";
import lodash_isArray from "lodash/isArray";
import {TypedParam} from "./_Base";
import {ExpressionController as ExpressionController2} from "./utils/ExpressionController";
import {ParamEvent as ParamEvent2} from "../poly/ParamEvent";
export class TypedNumericParam extends TypedParam {
  get is_numeric() {
    return true;
  }
  get is_default() {
    return this._raw_input == this.default_value;
  }
  _prefilter_invalid_raw_input(raw_input) {
    if (lodash_isArray(raw_input)) {
      return raw_input[0];
    } else {
      return raw_input;
    }
  }
  process_raw_input() {
    this.states.error.clear();
    const converted = this.convert(this._raw_input);
    if (converted != null) {
      if (this._expression_controller) {
        this._expression_controller.set_expression(void 0, false);
        this.emit_controller.emit(ParamEvent2.EXPRESSION_UPDATED);
      }
      if (converted != this._value) {
        this._update_value(converted);
        this.set_successors_dirty(this);
      }
    } else {
      if (lodash_isString(this._raw_input)) {
        this._expression_controller = this._expression_controller || new ExpressionController2(this);
        if (this._raw_input != this._expression_controller.expression) {
          this._expression_controller.set_expression(this._raw_input);
          this.emit_controller.emit(ParamEvent2.EXPRESSION_UPDATED);
        }
      } else {
        this.states.error.set(`param input is invalid (${this.full_path()})`);
      }
    }
  }
  async process_computation() {
    if (this.expression_controller?.active && !this.expression_controller.requires_entities) {
      const expression_result = await this.expression_controller.compute_expression();
      if (this.expression_controller.is_errored) {
        this.states.error.set(`expression error: "${this.expression_controller.expression}" (${this.expression_controller.error_message})`);
      } else {
        const converted = this.convert(expression_result);
        if (converted != null) {
          if (this.states.error.active) {
            this.states.error.clear();
          }
          this._update_value(converted);
        } else {
          this.states.error.set(`expression returns an invalid type (${expression_result}) (${this.expression_controller.expression})`);
        }
      }
    }
  }
  _update_value(new_value) {
    this._value = new_value;
    if (this.parent_param) {
      this.parent_param.set_value_from_components();
    }
    this.options.execute_callback();
    this.emit_controller.emit(ParamEvent2.VALUE_UPDATED);
    this.remove_dirty_state();
  }
}
