import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

export class ButtonParam extends Single<ParamType.BUTTON> {
	static type() {
		return ParamType.BUTTON;
	}
	press_button() {
		this.options.execute_callback();
	}
}
