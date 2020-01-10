import {BaseParam} from '../_Base';

export class ExpressionController {
	_expression: string | null;
	constructor(protected param: BaseParam) {}

	get active() {
		return this._expression != null;
	}
	set_expression(expression: string | null) {
		// TODO: typescript: what if param is a multiple?
		this._expression = expression;
		this.param.set_dirty();
	}

	async eval() {
		// TODO: typescript
	}
}
