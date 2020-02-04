import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

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
}
