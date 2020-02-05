import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from '../nodes/utils/params/ParamsController';

export class ButtonParam extends Single<ParamType.BUTTON> {
	static type() {
		return ParamType.BUTTON;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get value_serialized() {
		return this.value;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.BUTTON], val2: ParamValuesTypeMap[ParamType.BUTTON]) {
		return true;
	}
	press_button() {
		this.options.execute_callback();
	}
}
