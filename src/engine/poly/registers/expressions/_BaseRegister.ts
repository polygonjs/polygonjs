import {BaseMethod} from '../../../expressions/methods/_Base';

export class BaseExpressionRegister {
	private _methods_names: string[] = [];
	private _methods_by_name: Map<string, typeof BaseMethod> = new Map();

	register(expression: typeof BaseMethod, name: string) {
		this._methods_names.push(name);
		this._methods_by_name.set(name, expression);
	}
	getMethod(name: string) {
		return this._methods_by_name.get(name);
	}
	availableMethods(): string[] {
		return this._methods_names;
	}
}
