import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

export class ButtonParam extends Single<ParamType.BUTTON> {
	static type() {
		return ParamType.BUTTON;
	}
}
