// import lodash_each from 'lodash/each'
import lodash_isString from 'lodash/isString';
// import lodash_isNumber from 'lodash/isNumber'
import {TypedParam} from './_Base';
// import {TypedParamVisitor} from './_Base';
// import {AsCodeString} from './concerns/visitors/String';
// import {ExpressionController} from '../expressions/ExpressionController'
import {ParsedTree} from '../expressions/traversers/ParsedTree';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ExpressionController} from './utils/ExpressionController';
import {ParamEvent} from '../poly/ParamEvent';

export class StringParam extends TypedParam<ParamType.STRING> {
	static type() {
		return ParamType.STRING;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.STRING]) {
		return `${raw_input}`;
	}
	get raw_input_serialized() {
		return `${this._raw_input}`;
	}
	get value_serialized() {
		return `${this.value}`;
	}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.STRING],
		raw_input2: ParamInitValuesTypeMap[ParamType.STRING]
	) {
		return raw_input1 == raw_input2;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.STRING], val2: ParamValuesTypeMap[ParamType.STRING]) {
		return val1 == val2;
	}
	get is_default(): boolean {
		return this._raw_input == this.default_value;
	}

	convert(raw_val: any): string {
		if (lodash_isString(raw_val)) {
			return raw_val;
		}
		return `${raw_val}`;
	}

	get raw_input() {
		return this._raw_input;
	}
	protected process_raw_input() {
		this.states.error.clear();

		if (this._value_elements(this._raw_input).length >= 3) {
			this._expression_controller = this._expression_controller || new ExpressionController(this);
			if (this._raw_input != this._expression_controller.expression) {
				this._expression_controller.set_expression(this._raw_input);
				this.set_dirty();
				this.emit_controller.emit(ParamEvent.EXPRESSION_UPDATED);
			}
		} else {
			if (this._raw_input != this._value) {
				this._value = this._raw_input;
				this.remove_dirty_state();
				this.set_successors_dirty(this);
				this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
				if (this._expression_controller) {
					this._expression_controller.set_expression(undefined, false);
					this.emit_controller.emit(ParamEvent.EXPRESSION_UPDATED); // ensure expression is considered removed
				}
			}
		}
	}
	protected async process_computation(): Promise<void> {
		if (this.expression_controller?.active && !this.expression_controller.requires_entities) {
			const expression_result = await this.expression_controller.compute_expression();
			if (this.expression_controller.is_errored) {
				this.states.error.set(`expression error: ${this.expression_controller.error_message}`);
			} else {
				const converted = this.convert(expression_result);
				// we need to check if equal nulls explicitely
				// as the empty string '' evals to false...
				if (converted != null) {
					this._value = converted;
					this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
				} else {
					this.states.error.set(`expression returns an invalid type (${expression_result})`);
				}
				this.remove_dirty_state();
			}
		}
	}

	private _value_elements(v: string): string[] {
		return ParsedTree.string_value_elements(v);
	}
}
