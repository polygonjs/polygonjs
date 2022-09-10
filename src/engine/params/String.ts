import {ParamEvent} from './../poly/ParamEvent';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {CoreType} from '../../core/Type';
import {TypedStringParam} from './_BaseString';

export class StringParam extends TypedStringParam<ParamType.STRING> {
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

	override convert(rawVal: any): string {
		if (CoreType.isString(rawVal)) {
			return rawVal;
		}
		return `${rawVal}`;
	}

	override rawInput() {
		return this._raw_input;
	}
	protected _assignValue(value: string): void {
		this._value = value;
	}
	protected processRawInputWithoutExpression() {
		if (this._raw_input != this._value) {
			this._assignValue(this._raw_input);
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
