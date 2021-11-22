import {BaseParamType} from '../params/_Base';
import {ParsedTree} from './traversers/ParsedTree';
// import {MissingReferencesController} from './MissingReferencesController'
// import CoreWalker from 'src/core/Walker'

import {FunctionGenerator} from './traversers/FunctionGenerator';
import {ExpressionStringGenerator} from './traversers/ExpressionStringGenerator';
import {DependenciesController} from './DependenciesController';
import {ParamType} from '../poly/ParamType';

export class ExpressionManager {
	public parse_completed: boolean = false;
	private parse_started: boolean = false;
	private _functionGenerator: FunctionGenerator;
	private expression_string_generator: ExpressionStringGenerator | undefined;
	public dependencies_controller: DependenciesController;
	// private _error_message: string | undefined;
	private parsed_tree: ParsedTree = new ParsedTree();

	constructor(
		public param: BaseParamType // public element_index: number=0
	) {
		this._functionGenerator = new FunctionGenerator(this.param);
		this.dependencies_controller = new DependenciesController(this.param);
	}

	parseExpression(expression: string) {
		if (this.parse_started) {
			throw new Error(`parse in progress for param ${this.param.path()}`);
		}
		this.parse_started = true;
		this.parse_completed = false;
		this.parsed_tree = this.parsed_tree || new ParsedTree();

		this.reset();
		if (this.param.type() == ParamType.STRING) {
			this.parsed_tree.parse_expression_for_string_param(expression);
		} else {
			this.parsed_tree.parse_expression(expression);
		}
		this._functionGenerator.parse_tree(this.parsed_tree);

		if (this._functionGenerator.error_message() == null) {
			this.dependencies_controller.update(this._functionGenerator);
			if (this.dependencies_controller.error_message) {
				this.param.states.error.set(this.dependencies_controller.error_message);
			} else {
				this.parse_completed = true;
				this.parse_started = false;
			}
		} //else {
		//this.set_error(this.function_generator.error_message);
		//}
	}
	async computeFunction(): Promise<any> {
		// this.parse_and_update_dependencies_if_not_done(expression);
		if (this._computeAllowed()) {
			try {
				const new_value = await this._functionGenerator.evalFunction();
				return new_value;
			} catch (e) {
				// if (this.function_generator.is_errored && this.function_generator.error_message) {
				// 	this.set_error(this.function_generator.error_message);
				// }
				return; // new Promise((resolve, reject) => resolve());
			}
		} else {
			return new Promise((resolve, reject) => {
				resolve(null);
			});
		}
	}

	reset() {
		this.parse_completed = false;
		this.parse_started = false;
		// this._error_message = undefined;
		// if(force){ // || this.element_index <= 1){
		this.dependencies_controller.reset();
		// }
		this._functionGenerator.reset();
	}

	is_errored(): boolean {
		return this._functionGenerator.is_errored();
	}
	error_message() {
		return this._functionGenerator.error_message();
	}

	private _computeAllowed(): boolean {
		return /*this._error_message == null &&*/ this._functionGenerator.evalAllowed();
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

	updateFromMethodDependencyNameChange() {
		this.expression_string_generator =
			this.expression_string_generator || new ExpressionStringGenerator(this.param);

		const new_expression_string = this.expression_string_generator.parse_tree(this.parsed_tree);

		if (new_expression_string) {
			this.param.set(new_expression_string);
		} else {
			console.warn('failed to regenerate expression');
		}
		// this.param.expressionController?.set_expression(new_expression_string);

		// this.reset()
		// if (new_expression_string) {
		// this.parse_expression(new_expression_string);
		// }
	}
}
