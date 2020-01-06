import {Single} from './_Single'

export class SeparatorParam extends Single<null> {
	constructor() {
		super()
	}
	static type() {
		return ParamType.SEPARATOR
	}
}
