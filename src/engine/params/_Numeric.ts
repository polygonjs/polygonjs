import lodash_isString from 'lodash/isString';
// import lodash_isNumber from 'lodash/isNumber';
// import lodash_isBoolean from 'lodash/isBoolean';
// import {TypedParamVisitor} from './_Base';
import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
// import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ExpressionController} from './utils/ExpressionController';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
// import {ParamEvent} from '../poly/ParamEvent';
// import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';

// interface NumericParamVisitor extends TypedParamVisitor {
// 	visit_numeric_param: (param: TypedNumericParam<any>) => any;
// }

export abstract class TypedNumericParam<T extends ParamType> extends TypedParam<T> {
	// private _raw_input: ParamInitValuesTypeMap[T] | undefined;
	get is_numeric() {
		return true;
	}
	get is_default(): boolean {
		return this._raw_input == this.default_value;
	}

	// accepts_visitor(visitor: NumericParamVisitor): any {
	// 	return visitor.visit_numeric_param(this);
	// }
	// init_expression() {
	// 	if (this.is_value_expression(this._default_value)) {
	// 		return this.set_expression(this._default_value)
	// 	}
	// }

	protected process_raw_input() {
		// this.process_raw_input()
		// if (this.parent_param) {
		// 	this.parent_param.set_raw_input_from_components();
		// }

		this.states.error.clear();

		const converted = this.convert(this._raw_input);
		if (converted != null) {
			if (this._expression_controller) {
				this._expression_controller.set_expression(undefined, false);
				this.emit_controller.emit(ParamEvent.EXPRESSION_UPDATED); // ensure expression is considered removed
			}
			if (converted != this._value) {
				this._update_value(converted);
				this.set_successors_dirty();
			}
		} else {
			if (lodash_isString(this._raw_input)) {
				this._expression_controller = this._expression_controller || new ExpressionController(this);
				if (this._raw_input != this._expression_controller.expression) {
					this._expression_controller.set_expression(this._raw_input);
					this.emit_controller.emit(ParamEvent.EXPRESSION_UPDATED);
				}
			} else {
				this.states.error.set(`param input is invalid (${this.full_path()})`);
			}
		}
	}
	protected async process_computation(): Promise<void> {
		if (this.expression_controller?.active && !this.expression_controller.requires_entities) {
			const expression_result = await this.expression_controller.compute_expression();
			if (this.expression_controller.is_errored) {
				this.states.error.set(
					`expression error: "${this.expression_controller.expression}" (${this.expression_controller.error_message})`
				);
			} else {
				const converted = this.convert(expression_result);
				if (converted != null) {
					this._update_value(converted);
				} else {
					this.states.error.set(
						`expression returns an invalid type (${expression_result}) (${this.expression_controller.expression})`
					);
				}
			}
		}
	}
	private _update_value(new_value: ParamValuesTypeMap[T]) {
		this._value = new_value;
		if (this.parent_param) {
			this.parent_param.set_value_from_components();
		}
		this.options.execute_callback();
		this.emit_controller.emit(ParamEvent.VALUE_UPDATED);
		this.remove_dirty_state();
	}
}
