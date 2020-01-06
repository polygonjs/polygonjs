import {BaseParam} from 'src/engine/params/_Base'
import {ParsedTree} from './traversers/ParsedTree'
// import {MissingExpressionReference} from './MissingReference'
// import {MissingReferencesController} from './MissingReferencesController'
// import CoreWalker from 'src/core/Walker'

import {FunctionGenerator} from './traversers/FunctionGenerator'
import {ExpressionStringGenerator} from './traversers/ExpressionStringGenerator'
import {DependenciesController} from './DependenciesController'

export class ExpressionController {
	public parse_completed: boolean = false
	private parse_started: boolean = false
	private function_generator: FunctionGenerator
	private expression_string_generator: ExpressionStringGenerator
	public dependencies_controller: DependenciesController
	public error_message: string
	private parsed_tree: ParsedTree = new ParsedTree()

	constructor(
		public param: BaseParam // public element_index: number=0
	) {
		this.function_generator = new FunctionGenerator(this.param)
		this.dependencies_controller = new DependenciesController(this.param)
	}

	parse_expression(expression: string) {
		if (this.parse_started) {
			throw new Error(
				`parse in progress for param ${this.param.full_path()}`
			)
		}
		this.parse_started = true
		this.parse_completed = false
		this.parsed_tree = this.parsed_tree || new ParsedTree()

		this.reset()
		if (this.param.type() == ParamType.STRING) {
			this.parsed_tree.parse_expression_for_string_param(expression)
		} else {
			this.parsed_tree.parse_expression(expression)
		}
		this.function_generator.parse_tree(this.parsed_tree)

		if (this.function_generator.error_message == null) {
			this.dependencies_controller.update(this.function_generator)
			if (this.dependencies_controller.error_message) {
				this.param.set_error(this.dependencies_controller.error_message)
			} else {
				this.parse_completed = true
				this.parse_started = false
			}
		} else {
			this.set_error(this.function_generator.error_message)
		}
	}

	reset() {
		this.parse_completed = false
		this.parse_started = false
		this.error_message = null
		// if(force){ // || this.element_index <= 1){
		this.dependencies_controller.reset()
		// }
		this.function_generator.reset()
	}

	protected set_error(message: string) {
		this.error_message = this.error_message || message
	}

	eval_allowed(): boolean {
		return (
			this.error_message == null && this.function_generator.eval_allowed()
		)
	}

	eval_function(expression: string): Promise<any> {
		this.parse_and_update_dependencies_if_not_done(expression)

		if (this.eval_allowed()) {
			return this.function_generator.eval_function()
		} else {
			return new Promise((resolve, reject) => {
				resolve(null)
			})
		}
	}

	parse_and_update_dependencies(expression: string) {
		if (this.param.has_expression()) {
			this.parse_expression(expression)

			if (this.error_message != null) {
				this.param.set_error(
					`expression error: "${expression}" (${this.error_message})`
				)
			}
			// this.parse_completed = true
		}
	}
	private parse_and_update_dependencies_if_not_done(expression: string) {
		if (!this.parse_completed) {
			this.parse_and_update_dependencies(expression)
		}
	}

	update_from_method_dependency_name_change() {
		this.expression_string_generator =
			this.expression_string_generator ||
			new ExpressionStringGenerator(this.param)

		const new_expression_string = this.expression_string_generator.parse_tree(
			this.parsed_tree
		)
		this.param.set_expression(new_expression_string)

		// this.reset()
		this.parse_expression(new_expression_string)
	}
}
