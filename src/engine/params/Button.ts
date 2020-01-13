import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

export class ButtonParam extends Single<null> {
	// constructor() {
	// 	super()
	// }
	static type() {
		return ParamType.BUTTON;
	}
}
