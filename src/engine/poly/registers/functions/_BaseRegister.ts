import {BaseNamedFunction} from '../../../functions/_Base';

export class BaseNamedFunctionRegister {
	protected _functionByName: Map<string, typeof BaseNamedFunction> = new Map();

	register(namedFunction: typeof BaseNamedFunction) {
		const type = namedFunction.type();
		if (this._functionByName.get(type)) {
			console.warn(`namedFunction already registered`, type);
		}

		this._functionByName.set(type, namedFunction);
	}
}
