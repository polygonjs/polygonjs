import {Single} from './_Single';

export class SeparatorParam extends Single<null> {
	static type() {
		return ParamType.SEPARATOR;
	}
}
