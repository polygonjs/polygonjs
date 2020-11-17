import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class FolderParam extends TypedParam<ParamType.FOLDER> {
	static type() {
		return ParamType.FOLDER;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get raw_input_serialized() {
		return this._raw_input;
	}
	get value_serialized() {
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
