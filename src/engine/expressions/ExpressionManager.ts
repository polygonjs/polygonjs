import {BaseParamType} from '../params/_Base';
import {ParsedTree} from './traversers/ParsedTree';
import {FunctionGenerator} from './traversers/FunctionGenerator';
import {ExpressionStringGenerator} from './traversers/ExpressionStringGenerator';
import {DependenciesController} from './DependenciesController';
import {Poly} from '../Poly';

export class ExpressionManager {
	private _parseStarted: boolean = false;
	private _functionGenerator: FunctionGenerator;
	private _expressionStringGenerator: ExpressionStringGenerator | undefined;
	public dependenciesController: DependenciesController;
	private parsedTree: ParsedTree = new ParsedTree(this.param);

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
		this.parsedTree = this.parsedTree || new ParsedTree(this.param);

		this.reset();
		if (this.param.expressionParsedAsString()) {
			this.parsedTree.parseExpressionForStringParam(expression);
		} else {
			this.parsedTree.parseExpression(expression);
		}
		this._functionGenerator.parseTree(this.parsedTree);

		if (this._functionGenerator.errorMessage() == null) {
			this.dependenciesController.update(this._functionGenerator);
			const errorMessage = this.dependenciesController.errorMessage();
			if (errorMessage) {
				this.param.states.error.set(errorMessage);
			} else {
				this._parseStarted = false;
			}
		} //else {
		//this.set_error(this.function_generator.error_message);
		//}
	}
	async computeFunction(): Promise<any> {
		if (this._computeAllowed()) {
			try {
				const newValue = await this._functionGenerator.evalFunction();
				return newValue;
			} catch (e) {
				Poly.error('error while evaluating expression', e);
			}
		} else {
			Poly.error('compute not allowed');
		}
	}

	reset() {
		this._parseStarted = false;
		this.dependenciesController.reset();
		this._functionGenerator.reset();
	}

	isErrored(): boolean {
		return this._functionGenerator.isErrored();
	}
	errorMessage() {
		return this._functionGenerator.errorMessage();
	}

	private _computeAllowed(): boolean {
		return this._functionGenerator.evalAllowed();
	}

	updateFromMethodDependencyNameChange() {
		this._expressionStringGenerator = this._expressionStringGenerator || new ExpressionStringGenerator(this.param);

		const newExpressionString = this._expressionStringGenerator.parseTree(this.parsedTree);

		if (newExpressionString) {
			this.param.set(newExpressionString);
		} else {
			console.warn('failed to regenerate expression');
		}
	}
}
