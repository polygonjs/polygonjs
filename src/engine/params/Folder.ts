import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

export class FolderParam extends TypedParam<ParamType.FOLDER> {
	static override type() {
		return ParamType.FOLDER;
	}
	override defaultValueSerialized() {
		return this._default_value;
	}
	override rawInputSerialized() {
		return this._raw_input;
	}
	override valueSerialized() {
		return this.value;
	}
	protected override _copyValue(param: FolderParam) {}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.FOLDER],
		raw_input2: ParamInitValuesTypeMap[ParamType.FOLDER]
	) {
		return true;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.FOLDER],
		val2: ParamValuesTypeMap[ParamType.FOLDER]
	) {
		return true;
	}
}
