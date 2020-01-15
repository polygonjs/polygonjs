import {BaseParamType} from '../_Base';

export class ExpressionController {
	protected _expression: string | null;
	constructor(protected param: BaseParamType) {}

	get active() {
		return this._expression != null;
	}
	get expression() {
		return this._expression;
	}
	set_expression(expression: string | null) {
		// TODO: typescript: what if param is a multiple?
		this._expression = expression;
		this.param.set_dirty();
	}
	reset() {
		// TODO: typescript: called from string
	}
	update_expression_from_method_dependency_name_change() {}

	async compute_expression() {
		// TODO: typescript
	}
}
