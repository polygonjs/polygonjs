import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParsedTree} from './../expressions/traversers/ParsedTree';
import {ParamEvent} from './../poly/ParamEvent';
import {TypedParam} from './_Base';
import {ParamType} from '../poly/ParamType';
import {ExpressionController} from './utils/ExpressionController';

export abstract class TypedStringParam<
	T extends ParamType.STRING | ParamType.NODE_PATH | ParamType.PARAM_PATH
> extends TypedParam<T> {
	protected abstract _assignValue(value: ParamValuesTypeMap[T] | string): void;

	override expressionParsedAsString() {
		return true;
	}

	protected override processRawInput() {
		if (ParsedTree.stringValueElements(this._raw_input).length >= 3) {
			this._expression_controller = this._expression_controller || new ExpressionController(this);
			if (this._raw_input != this._expression_controller.expression()) {
				this.states.error.clear();
				this._expression_controller.set_expression(this._raw_input, false);
				this.setDirty();
				this.emitController.emit(ParamEvent.EXPRESSION_UPDATED);
			}
		} else {
			this.processRawInputWithoutExpression();
		}
	}
	protected abstract processRawInputWithoutExpression(): void;

	protected override async processComputation(): Promise<void> {
		if (this.expressionController?.active() && !this.expressionController.requires_entities()) {
			const expressionResult = await this.expressionController.computeExpression();
			if (this.expressionController.is_errored()) {
				this.states.error.set(
					`expression error: "${this.expressionController.expression()}" (${this.expressionController.error_message()})`
				);
			} else {
				const converted = this.convert(expressionResult);
				// we need to check if equal nulls explicitely
				// as the empty string '' evals to false...
				if (converted != null) {
					this.states.error.clear();
					this._assignValue(converted);
					this.emitController.emit(ParamEvent.VALUE_UPDATED);
					this.options.executeCallback();
				} else {
					this.states.error.set(`expression returns an invalid type (${expressionResult})`);
				}
				this.removeDirtyState();
			}
		}
	}
}
