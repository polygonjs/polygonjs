import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

export class SeparatorParam extends Single<null> {
	static type() {
		return ParamType.SEPARATOR;
	}
}
