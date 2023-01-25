import {ExpressionType} from '../../../expressions/methods/Common';
import {BaseMethod} from '../../../expressions/methods/_Base';

export class BaseExpressionRegister {
	private _methodsNames: ExpressionType[] = [];
	private _methodsByName: Map<ExpressionType, typeof BaseMethod> = new Map();

	register(expression: typeof BaseMethod, name: ExpressionType) {
		this._methodsNames.push(name);
		this._methodsByName.set(name, expression);
	}
	getMethod(name: ExpressionType) {
		return this._methodsByName.get(name);
	}
	availableMethods(): ExpressionType[] {
		return this._methodsNames;
	}
}
