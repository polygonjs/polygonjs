import {BaseParamType} from '../_Base';
import {ExpressionManager} from 'src/engine/expressions/ExpressionManager';

export class ExpressionController {
	protected _expression: string | null;
	protected _manager: ExpressionManager | null;
	constructor(protected param: BaseParamType) {}

	get active() {
		return this._expression != null;
	}
	get expression() {
		return this._expression;
	}
	get is_errored() {
		if (this._manager) {
			return this._manager.is_errored;
		}
		return false;
	}
	get error_message() {
		if (this._manager) {
			return this._manager.error_message;
		}
		return null;
	}
	set_expression(expression: string | null) {
		if (this._expression != expression) {
			this._expression = expression;

			if (this._expression) {
				this._manager = this._manager || new ExpressionManager(this.param);
				this._manager.parse_expression(this._expression);
			} else {
				if (this._manager) {
					this._manager.reset();
				}
			}

			this.param.set_dirty();
		}
	}

	update_from_method_dependency_name_change() {}

	async compute_expression() {
		if (this._manager && this.active) {
			return this._manager.compute_function();
		}
	}
}
