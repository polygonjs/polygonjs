// import lodash_each from 'lodash/each'
import lodash_isString from 'lodash/isString';
// import lodash_isNumber from 'lodash/isNumber'
import {Single} from './_Single';
import {TypedParamVisitor} from './_Base';
// import {AsCodeString} from './concerns/visitors/String';
// import {ExpressionController} from 'src/engine/expressions/ExpressionController'
import {ParsedTree} from 'src/engine/expressions/traversers/ParsedTree';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';
import {ExpressionController} from './utils/ExpressionController';
// import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';

interface StringParamVisitor extends TypedParamVisitor {
	visit_string_param: (param: StringParam) => any;
}

export class StringParam extends Single<ParamType.STRING> {
	// private _raw_input: string;
	// private _expression_controllers: ExpressionController[] = []

	static type() {
		return ParamType.STRING;
	}
	accepts_visitor(visitor: StringParamVisitor) {
		return visitor.visit_string_param(this);
	}

	convert(raw_val: any): string {
		if (lodash_isString(raw_val)) {
			return raw_val;
		}
		return `${raw_val}`;
	}

	set(raw_input: ParamInitValuesTypeMap[ParamType.STRING]): void {
		// this._raw_input = raw_input;
		// this.process_raw_input()
		this.states.error.clear();

		if (this._value_elements(raw_input).length >= 3) {
			this._expression_controller = this._expression_controller || new ExpressionController(this);
			if (raw_input != this._expression_controller.expression) {
				this._expression_controller.set_expression(raw_input);
				this.set_dirty();
			}
		} else {
			if (raw_input != this._value) {
				this._value = raw_input;
				this.remove_dirty_state();
				this.set_successors_dirty();
			}
		}
	}
	protected async process_computation(): Promise<void> {
		if (this.expression_controller?.active && !this.expression_controller.requires_entities) {
			const expression_result = await this.expression_controller.compute_expression();
			if (this.expression_controller.is_errored) {
				this.states.error.set(`expression error: ${this.expression_controller.error_message}`);
			} else {
				const converted = this.convert(expression_result);
				if (converted) {
					this._value = converted;
				} else {
					this.states.error.set(`expression returns an invalid type (${expression_result})`);
				}
				this.remove_dirty_state();
			}
		}
	}

	// convert_value(v): string {
	// 	if (v != null) {
	// 		if (lodash_isNumber(v) || lodash_isString(v)) {
	// 			return `${v}`
	// 		} else {
	// 			return `[${v.toArray().join(',')}]`
	// 		}
	// 	} else {
	// 		return ''
	// 	}
	// }
	// post_set_default_value() {
	// 	this.set_input_string(this._value)
	// }
	// set<ParamType.STRING>(new_value: ParamInitValuesTypeMap[ParamType.STRING]) {
	// 	// we need to avoid setting twice with the same value,
	// 	// as this would reset the dependencies via reset_expression_controllers()
	// 	// but not the expression controllers caches
	// 	if (this._raw_input != new_value) {
	// 		// this.reset_expression_controllers()
	// 		this.expression_controller.reset();
	// 		this._raw_input = new_value;
	// 		// if (this.is_value_expression(new_value)) {
	// 		// 	this.set_expression(new_value)
	// 		// } else {
	// 		// 	this.set_value(new_value)
	// 		// }
	// 		// this.set_input_string(new_value)
	// 	}
	// }
	// is_raw_input_default(): boolean {
	// 	return this.input_string() == this.default_value()
	// }

	// set_input_string(string: string) {
	// 	this._input_string = string
	// }

	// input_string(): string {
	// 	return this._input_string
	// }

	// private has_expression(): boolean {
	// 	return this._value_elements(this._raw_input).length > 1;
	// }

	// private _value_contains_expression(v:string): boolean{
	// 	return ParamString.value_contains_expression(v)
	// }
	// static value_contains_expression(v:string): boolean{
	// 	// return ((this._value_elements(v).length - 1) % 2) === 0;
	// }

	private _value_elements(v: string): string[] {
		return ParsedTree.string_value_elements(v);
	}
	// static value_elements(v:string):string[]{
	// 	return ParsedTree.string_value_elements(v)
	// 	// if (v != null) {
	// 	// 	return `${v}`.split(EXPRESSION_SEPARATOR);
	// 	// } else {
	// 	// 	return [];
	// 	// }
	// }
	// protected async eval_raw_expression(): Promise<string>{
	// 	// this.parse_expression_and_update_dependencies_if_not_done()
	// 	const values = await Promise.all(this.expression_elements_promises())
	// 	const value = values.join('')
	// 	return value
	// }

	// private expression_elements_promises(){
	// 	const elements = this._value_elements(this._input_string)
	// 	return elements.map((element, i)=>{
	// 		const is_expression = ((i%2) == 1)
	// 		return this.eval_raw_expression_element(element, i, is_expression)
	// 	})
	// }
	// parse_expression_and_update_dependencies() {
	// 	// do nothing for string params
	// }

	// private async eval_raw_expression_element(element: string, element_index: number, is_expression: boolean): Promise<string>{
	// 	if(is_expression){
	// 		let value = await this._expression_controller_by_index(element_index).eval_function(element)

	// 		if (value != null) {
	// 			value = this.self.convert_value(value);
	// 		}
	// 		return value
	// 	} else {
	// 		return element
	// 	}
	// }

	// private _expression_controller_by_index(element_index): ExpressionController{
	// 	return this._expression_controllers[element_index] = this._expression_controllers[element_index] || new ExpressionController(this.self, element_index)
	// }

	// private reset_expression_controllers(){
	// 	let expression_controller;
	// 	for(let i=0; i<this._expression_controllers.length; i++){
	// 		expression_controller = this._expression_controllers[i]
	// 		if(expression_controller){
	// 			expression_controller.reset(true)
	// 		}
	// 	}
	// }
}
