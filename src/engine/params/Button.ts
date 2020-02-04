import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

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
	press_button() {
		this.options.execute_callback();
	}
}
