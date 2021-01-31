import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class SeparatorParam extends TypedParam<ParamType.SEPARATOR> {
	static type() {
		return ParamType.SEPARATOR;
	}
	defaultValueSerialized() {
		return this.default_value;
	}
	rawInputSerialized() {
		return this._raw_input;
	}
	valueSerialized() {
		return this.value;
	}
	protected _copy_value(param: SeparatorParam) {}

	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.SEPARATOR],
		raw_input2: ParamInitValuesTypeMap[ParamType.SEPARATOR]
	) {
		return true;
	}
	static are_values_equal(
		val1: ParamValuesTypeMap[ParamType.SEPARATOR],
		val2: ParamValuesTypeMap[ParamType.SEPARATOR]
	) {
		return true;
	}
}
