import {TypedParam} from './_Base';
import {ParsedTree} from '../expressions/traversers/ParsedTree';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ExpressionController} from './utils/ExpressionController';
import {ParamEvent} from '../poly/ParamEvent';
import {CoreType} from '../../core/Type';

export class StringParam extends TypedParam<ParamType.STRING> {
	static override type() {
		return ParamType.STRING;
	}
	override defaultValueSerialized() {
		return this._default_value;
	}
	protected override _cloneRawInput(raw_input: ParamInitValuesTypeMap[ParamType.STRING]) {
		return `${raw_input}`;
	}
	override rawInputSerialized() {
		return `${this._raw_input}`;
	}
	override valueSerialized() {
		return `${this.value}`;
	}
	protected override _copyValue(param: StringParam) {
		this.set(param.value);
	}

	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.STRING],
		raw_input2: ParamInitValuesTypeMap[ParamType.STRING]
	) {
		return raw_input1 == raw_input2;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.STRING],
		val2: ParamValuesTypeMap[ParamType.STRING]
	) {
		return val1 == val2;
	}
	override isDefault(): boolean {
		return this._raw_input == this._default_value;
	}

	override convert(raw_val: any): string {
		if (CoreType.isString(raw_val)) {
			return raw_val;
		}
		return `${raw_val}`;
	}

	override rawInput() {
		return this._raw_input;
	}
	protected override processRawInput() {
		this.states.error.clear();

		if (this._value_elements(this._raw_input).length >= 3) {
			this._expression_controller = this._expression_controller || new ExpressionController(this);
			if (this._raw_input != this._expression_controller.expression()) {
				this._expression_controller.set_expression(this._raw_input);
				this.setDirty();
				this.emitController.emit(ParamEvent.EXPRESSION_UPDATED);
			}
		} else {
			if (this._raw_input != this._value) {
				this._value = this._raw_input;
				this.removeDirtyState();
				this.setSuccessorsDirty(this);
				this.emitController.emit(ParamEvent.VALUE_UPDATED);
				this.options.executeCallback();
				if (this._expression_controller) {
					this._expression_controller.set_expression(undefined, false);
					this.emitController.emit(ParamEvent.EXPRESSION_UPDATED); // ensure expression is considered removed
				}
			}
		}
	}
	protected override async processComputation(): Promise<void> {
		if (this.expressionController?.active() && !this.expressionController.requires_entities()) {
			const expression_result = await this.expressionController.computeExpression();
			if (this.expressionController.is_errored()) {
				this.states.error.set(`expression error: ${this.expressionController.error_message()}`);
			} else {
				const converted = this.convert(expression_result);
				// we need to check if equal nulls explicitely
				// as the empty string '' evals to false...
				if (converted != null) {
					this._value = converted;
					this.emitController.emit(ParamEvent.VALUE_UPDATED);
					this.options.executeCallback();
				} else {
					this.states.error.set(`expression returns an invalid type (${expression_result})`);
				}
				this.removeDirtyState();
			}
		}
	}

	private _value_elements(v: string): string[] {
		return ParsedTree.string_value_elements(v);
	}
}
