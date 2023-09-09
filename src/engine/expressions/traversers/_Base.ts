import {BaseParamType} from '../../params/_Base';
import jsep from 'jsep';
import {CoreType} from '../../../core/Type';
export const VARIABLE_PREFIX = '$';

export abstract class BaseTraverser {
	private _errorMessage: string | undefined;

	constructor(public param: BaseParamType) {}

	protected clearError() {
		this._errorMessage = undefined;
	}
	protected setError(message: string) {
		this._errorMessage = this._errorMessage || message;
	}
	protected _set_error_from_error_bound = this._set_error_from_error.bind(this);
	private _set_error_from_error(error: Error | string) {
		if (CoreType.isString(error)) {
			this._errorMessage = error;
		} else {
			this._errorMessage = error.message;
		}
	}
	isErrored(): boolean {
		return this._errorMessage != null;
	}
	errorMessage() {
		return this._errorMessage;
	}
	reset() {
		this._errorMessage = undefined;
	}

	traverse_node(node: jsep.Expression): string | undefined {
		const method_name = `traverse_${node.type}`;
		const method = (this as any)[method_name];
		if (method) {
			return (this as any)[method_name](node);
		} else {
			this.setError(`expression unknown node type: ${node.type}`);
		}
	}

	protected traverse_BinaryExpression(node: jsep.BinaryExpression): string {
		return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
	}
	// protected traverse_LogicalExpression(node: jsep.LogicalExpression): string {
	// 	// || or &&
	// 	return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
	// }
	protected traverse_MemberExpression(node: jsep.MemberExpression): string {
		return `${this.traverse_node(node.object)}.${this.traverse_node(node.property)}`;
	}
	protected traverse_ConditionalExpression(node: jsep.ConditionalExpression): string {
		return `(${this.traverse_node(node.test)}) ? (${this.traverse_node(node.consequent)}) : (${this.traverse_node(
			node.alternate
		)})`;
	}

	// currently only used for string expressions such as
	// pt_`@ptnum+1`
	protected traverse_Compound(node: jsep.Compound): string {
		const args = node.body;
		let traversed_args = [];
		for (let i = 0; i < args.length; i++) {
			const arg_node = args[i];
			if (arg_node.type == 'Identifier') {
				if ((arg_node as jsep.Identifier).name[0] == VARIABLE_PREFIX) {
					traversed_args.push('`${' + this.traverse_node(arg_node) + '}`');
				} else {
					traversed_args.push(`'${(arg_node as jsep.Identifier).name}'`);
				}
			} else {
				traversed_args.push('`${' + this.traverse_node(arg_node) + '}`');
			}
		}
		return traversed_args.join(' + ');
	}

	protected traverse_Literal(node: jsep.Literal): string {
		return `${node.raw}`; // 5 or 'string' (raw will include quotes)
	}

	protected abstract traverse_Identifier(node: jsep.Identifier): string | undefined;
	protected abstract traverse_CallExpression(node: jsep.CallExpression): string | undefined;
	protected abstract traverse_UnaryExpression(node: jsep.UnaryExpression): string;
}
