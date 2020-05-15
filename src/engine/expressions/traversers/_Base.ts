import {BaseParamType} from '../../params/_Base';
import lodash_isString from 'lodash/isString';
import jsep from 'jsep';
export const VARIABLE_PREFIX = '$';

export abstract class BaseTraverser {
	public _error_message: string | undefined;

	constructor(public param: BaseParamType) {}

	protected clear_error() {
		this._error_message = undefined;
	}
	protected set_error(message: string) {
		this._error_message = this._error_message || message;
	}
	protected _set_error_from_error_bound = this._set_error_from_error.bind(this);
	private _set_error_from_error(error: Error | string) {
		if (lodash_isString(error)) {
			this._error_message = error;
		} else {
			this._error_message = error.message;
		}
	}
	get is_errored(): boolean {
		return this._error_message != null;
	}
	get error_message() {
		return this._error_message;
	}
	reset() {
		this._error_message = undefined;
	}

	traverse_node(node: jsep.Expression): string | undefined {
		const method_name = `traverse_${node.type}`;
		const method = (this as any)[method_name];
		if (method) {
			return (this as any)[method_name](node);
		} else {
			this.set_error(`expression unknown node type: ${node.type}`);
		}
	}

	protected abstract traverse_CallExpression(node: jsep.CallExpression): string | undefined; //{

	protected traverse_BinaryExpression(node: jsep.BinaryExpression): string {
		return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
	}
	protected traverse_LogicalExpression(node: jsep.LogicalExpression): string {
		// || or &&
		return `${this.traverse_node(node.left)} ${node.operator} ${this.traverse_node(node.right)}`;
	}
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
	protected abstract traverse_UnaryExpression(node: jsep.UnaryExpression): string; //{

	protected traverse_Literal(node: jsep.Literal): string {
		return `${node.raw}`; // 5 or 'string' (raw will include quotes)
	}

	protected abstract traverse_Identifier(node: jsep.Identifier): string | undefined; //{
}
