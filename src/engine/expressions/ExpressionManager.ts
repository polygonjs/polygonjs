import {BaseParamType} from '../params/_Base';
import {ParsedTree} from './traversers/ParsedTree';
import {FunctionGenerator} from './traversers/FunctionGenerator';
import {ExpressionStringGenerator} from './traversers/ExpressionStringGenerator';
import {DependenciesController} from './DependenciesController';

export class ExpressionManager {
	private _parseStarted: boolean = false;
	private _functionGenerator: FunctionGenerator;
	private _expressionStringGenerator: ExpressionStringGenerator | undefined;
	public dependenciesController: DependenciesController;
	// private _error_message: string | undefined;
	private parsedTree: ParsedTree = new ParsedTree();

	constructor(
		public param: BaseParamType // public element_index: number=0
	) {
		this._functionGenerator = new FunctionGenerator(this.param);
		this.dependenciesController = new DependenciesController(this.param);
	}
	generatedFunctionEntitiesDependent() {
		return this._functionGenerator.entitiesDependent();
	}

	parseExpression(expression: string) {
		if (this._parseStarted) {
			throw new Error(`parse in progress for param ${this.param.path()}`);
		}
		this._parseStarted = true;
		this.parsedTree = this.parsedTree || new ParsedTree();

		this.reset();
		if (this.param.expressionParsedAsString()) {
			this.parsedTree.parseExpressionForStringParam(expression);
		} else {
			this.parsedTree.parseExpression(expression);
		}
		this._functionGenerator.parseTree(this.parsedTree);

		if (this._functionGenerator.error_message() == null) {
			this.dependenciesController.update(this._functionGenerator);
			if (this.dependenciesController.error_message) {
				this.param.states.error.set(this.dependenciesController.error_message);
			} else {
				this._parseStarted = false;
			}
		} //else {
		//this.set_error(this.function_generator.error_message);
		//}
	}
	async computeFunction(): Promise<any> {
		// this.parse_and_update_dependencies_if_not_done(expression);
		if (this._computeAllowed()) {
			try {
				const newValue = await this._functionGenerator.evalFunction();
				return newValue;
			} catch (e) {
				// if (this.function_generator.is_errored && this.function_generator.error_message) {
				// 	this.set_error(this.function_generator.error_message);
				// }
				// return new Promise((resolve, reject) => {
				// 	resolve(null);
				// })
			}
		} else {
			// return new Promise((resolve, reject) => {
			// 	resolve(null);
			// });
		}
	}

	reset() {
		this._parseStarted = false;
		// this._error_message = undefined;
		// if(force){ // || this.element_index <= 1){
		this.dependenciesController.reset();
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
		this._expressionStringGenerator = this._expressionStringGenerator || new ExpressionStringGenerator(this.param);

		const new_expression_string = this._expressionStringGenerator.parse_tree(this.parsedTree);

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
