import {BaseMethod} from '../../../expressions/methods/_Base';

export class BaseExpressionRegister {
	private _methods_by_name: Map<string, typeof BaseMethod> = new Map();

	register_expression(expression: typeof BaseMethod, name: string) {
		this._methods_by_name.set(name, expression);
	}
	get_method(name: string) {
		return this._methods_by_name.get(name);
	}
}
