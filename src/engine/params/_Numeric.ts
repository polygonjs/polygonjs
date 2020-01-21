import lodash_isString from 'lodash/isString';
// import lodash_isNumber from 'lodash/isNumber';
// import lodash_isBoolean from 'lodash/isBoolean';
import {TypedParamVisitor} from './_Base';
import {Single} from './_Single';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';
// import {ParamEvent} from '../poly/ParamEvent';
// import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';

interface NumericParamVisitor extends TypedParamVisitor {
	visit_numeric_param: (param: TypedNumericParam<any>) => any;
}

export class TypedNumericParam<T extends ParamType> extends Single<T> {
	get is_numeric() {
		return true;
	}

	accepts_visitor(visitor: NumericParamVisitor): any {
		return visitor.visit_numeric_param(this);
	}
	// init_expression() {
	// 	if (this.is_value_expression(this._default_value)) {
	// 		return this.set_expression(this._default_value)
	// 	}
	// }

	set(raw_input: ParamInitValuesTypeMap[T]): void {
		// this._raw_input = raw_input;
		// this.process_raw_input()
		this.states.error.clear();

		const converted = this.convert(raw_input);
		if (converted != null) {
			if (converted != this._value) {
				this._value = converted;
				this.emit_controller.emit_param_updated();
				this.remove_dirty_state();
				this.set_successors_dirty();
			}
		} else {
			if (lodash_isString(raw_input)) {
				if (raw_input != this.expression_controller.expression) {
					this.expression_controller.set_expression(raw_input);
					this.emit_controller.emit_param_updated();
				}
			} else {
				this.states.error.set(`param input is invalid (${this.full_path()})`);
				this.emit_controller.emit_param_updated();
			}
		}
		if (this.parent_param) {
			this.parent_param.set_value_from_components();
		}
	}
	async compute(): Promise<void> {
		if (this.expression_controller.active && !this.expression_controller.requires_entities) {
			const expression_result = await this.expression_controller.compute_expression();
			if (this.expression_controller.is_errored) {
				this.states.error.set(
					`expression error: "${this.expression_controller.expression}" (${this.expression_controller.error_message})`
				);
			} else {
				const converted = this.convert(expression_result);
				if (converted != null) {
					this._value = converted;
				} else {
					console.log('set err');
					this.states.error.set(
						`expression returns an invalid type (${expression_result}) (${this.expression_controller.expression})`
					);
				}
				this.remove_dirty_state();
			}
		}
	}
}
