import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ExpressionController} from './utils/ExpressionController';
import {ParamEvent} from '../poly/ParamEvent';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

export abstract class TypedNumericParam<T extends ParamType> extends TypedParam<T> {
	isNumeric() {
		return true;
	}
	isDefault(): boolean {
		return this._raw_input == this.default_value;
	}

	protected _prefilter_invalid_raw_input(raw_input: any): ParamInitValuesTypeMap[T] {
		if (CoreType.isArray(raw_input)) {
			return raw_input[0] as ParamInitValuesTypeMap[T];
		} else {
			return raw_input;
		}
	}

	protected process_raw_input() {
		this.states.error.clear();

		const converted = this.convert(this._raw_input);
		if (converted != null) {
			if (this._expression_controller) {
				this._expression_controller.set_expression(undefined, false);
				this.emitController.emit(ParamEvent.EXPRESSION_UPDATED); // ensure expression is considered removed
			}
			if (converted != this._value) {
				this._update_value(converted);
				this.setSuccessorsDirty(this);
			}
		} else {
			if (CoreType.isString(this._raw_input)) {
				this._expression_controller = this._expression_controller || new ExpressionController(this);
				if (this._raw_input != this._expression_controller.expression()) {
					this._expression_controller.set_expression(this._raw_input);
					this.emitController.emit(ParamEvent.EXPRESSION_UPDATED);
				}
			} else {
				this.states.error.set(`param input is invalid (${this.fullPath()})`);
			}
		}
	}
	protected async process_computation(): Promise<void> {
		if (this.expressionController?.active() && !this.expressionController.requires_entities()) {
			const expression_result = await this.expressionController.compute_expression();
			if (this.expressionController.is_errored()) {
				this.states.error.set(
					`expression error: "${this.expressionController.expression()}" (${this.expressionController.error_message()})`
				);
			} else {
				const converted = this.convert(expression_result);
				if (converted != null) {
					if (this.states.error.active()) {
						this.states.error.clear();
					}
					this._update_value(converted);
				} else {
					this.states.error.set(
						`expression returns an invalid type (${expression_result}) (${this.expressionController.expression()})`
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
		this.emitController.emit(ParamEvent.VALUE_UPDATED);
		this.removeDirtyState();
	}
}
