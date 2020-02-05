import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from '../nodes/utils/params/ParamsController';

export class SeparatorParam extends Single<ParamType.SEPARATOR> {
	static type() {
		return ParamType.SEPARATOR;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get value_serialized() {
		return this.value;
	}
	static are_values_equal(
		val1: ParamValuesTypeMap[ParamType.SEPARATOR],
		val2: ParamValuesTypeMap[ParamType.SEPARATOR]
	) {
		return true;
	}
}
