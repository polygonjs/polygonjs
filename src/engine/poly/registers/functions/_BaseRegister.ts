import {BaseNamedFunction} from '../../../functions/_Base';

export interface NamedFunctionRegisterOptions {
	printWarnings?: boolean;
}
export class BaseNamedFunctionRegister {
	protected _functionByName: Map<string, typeof BaseNamedFunction> = new Map();

	register(namedFunction: typeof BaseNamedFunction, options?: NamedFunctionRegisterOptions) {
		let printWarnings = options?.printWarnings;
		if (printWarnings == null) {
			printWarnings = true;
		}

		const type = namedFunction.type();
		if (this._functionByName.get(type) && printWarnings) {
			console.warn(`namedFunction already registered`, type);
		}

		this._functionByName.set(type, namedFunction);
	}
}
