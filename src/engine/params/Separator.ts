import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';

export class SeparatorParam extends Single<ParamType.SEPARATOR> {
	static type() {
		return ParamType.SEPARATOR;
	}
}
