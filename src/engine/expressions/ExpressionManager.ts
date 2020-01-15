import {BaseParamType} from 'src/engine/params/_Base';
import {ParsedTree} from './traversers/ParsedTree';
// import {MissingExpressionReference} from './MissingReference'
// import {MissingReferencesController} from './MissingReferencesController'
// import CoreWalker from 'src/core/Walker'

import {FunctionGenerator} from './traversers/FunctionGenerator';
import {ExpressionStringGenerator} from './traversers/ExpressionStringGenerator';
import {DependenciesController} from './DependenciesController';
import {ParamType} from '../poly/ParamType';

export class ExpressionManager {
	public parse_completed: boolean = false;
	private parse_started: boolean = false;
	private function_generator: FunctionGenerator;
	private expression_string_generator: ExpressionStringGenerator;
	public dependencies_controller: DependenciesController;
	private _error_message: string | null;
	private parsed_tree: ParsedTree = new ParsedTree();

	constructor(
		public param: BaseParamType // public element_index: number=0
	) {
		this.function_generator = new FunctionGenerator(this.param);
		this.dependencies_controller = new DependenciesController(this.param);
	}

	parse_expression(expression: string) {
		if (this.parse_started) {
			throw new Error(`parse in progress for param ${this.param.full_path()}`);
		}
		this.parse_started = true;
		this.parse_completed = false;
		this.parsed_tree = this.parsed_tree || new ParsedTree();

		this.reset();
		if (this.param.type == ParamType.STRING) {
			this.parsed_tree.parse_expression_for_string_param(expression);
		} else {
			this.parsed_tree.parse_expression(expression);
		}
		this.function_generator.parse_tree(this.parsed_tree);

		if (this.function_generator.error_message == null) {
			this.dependencies_controller.update(this.function_generator);
			if (this.dependencies_controller.error_message) {
				this.param.states.error.set(this.dependencies_controller.error_message);
			} else {
				this.parse_completed = true;
				this.parse_started = false;
			}
		} else {
			this.set_error(this.function_generator.error_message);
		}
	}
	compute_function(): Promise<any> {
		// this.parse_and_update_dependencies_if_not_done(expression);

		if (this.compute_allowed()) {
			return this.function_generator.eval_function();
		} else {
			return new Promise((resolve, reject) => {
				resolve(null);
			});
		}
	}

	reset() {
		this.parse_completed = false;
		this.parse_started = false;
		this._error_message = null;
		// if(force){ // || this.element_index <= 1){
		this.dependencies_controller.reset();
		// }
		this.function_generator.reset();
	}

	protected set_error(message: string) {
		this._error_message = this._error_message || message;
	}
	get is_errored() {
		return this._error_message != null;
	}
	get error_message() {
		return this._error_message;
	}

	private compute_allowed(): boolean {
		return this._error_message == null && this.function_generator.eval_allowed();
	}

	// private parse_and_update_dependencies(expression: string) {
	// 	if (this.param.has_expression()) {
	// 		this.parse_expression(expression);

	// 		if (this.error_message != null) {
	// 			this.param.states.error.set(`expression error: "${expression}" (${this.error_message})`);
	// 		}
	// 		// this.parse_completed = true
	// 	}
	// }
	// private parse_and_update_dependencies_if_not_done(expression: string) {
	// 	if (!this.parse_completed) {
	// 		this.parse_and_update_dependencies(expression);
	// 	}
	// }

	update_from_method_dependency_name_change() {
		this.expression_string_generator =
			this.expression_string_generator || new ExpressionStringGenerator(this.param);

		const new_expression_string = this.expression_string_generator.parse_tree(this.parsed_tree);
		this.param.set_expression(new_expression_string);

		// this.reset()
		if (new_expression_string) {
			this.parse_expression(new_expression_string);
		}
	}
}
