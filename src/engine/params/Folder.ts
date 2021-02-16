import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class FolderParam extends TypedParam<ParamType.FOLDER> {
	static type() {
		return ParamType.FOLDER;
	}
	defaultValueSerialized() {
		return this._default_value;
	}
	rawInputSerialized() {
		return this._raw_input;
	}
	valueSerialized() {
		return this.value;
	}
	protected _copy_value(param: FolderParam) {}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.FOLDER],
		raw_input2: ParamInitValuesTypeMap[ParamType.FOLDER]
	) {
		return true;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.FOLDER], val2: ParamValuesTypeMap[ParamType.FOLDER]) {
		return true;
	}
}
