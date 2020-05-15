import {BaseParamType} from '../../params/_Base';
import {ParsedTree} from './ParsedTree';
import jsep from 'jsep';

const ARGUMENTS_SEPARATOR = ', ';

import {BaseTraverser} from './_Base';

export class ExpressionStringGenerator extends BaseTraverser {
	constructor(public param: BaseParamType) {
		super(param);
	}

	parse_tree(parsed_tree: ParsedTree) {
		if (parsed_tree.error_message == null && parsed_tree.node) {
			try {
				return this.traverse_node(parsed_tree.node);
			} catch (e) {
				this.set_error('could not traverse tree');
			}
		} else {
			this.set_error('cannot parse tree');
		}
	}

	protected traverse_CallExpression(node: jsep.CallExpression): string {
		const method_arguments = node.arguments.map((arg) => {
			return this.traverse_node(arg);
		});
		const arguments_joined = `${method_arguments.join(ARGUMENTS_SEPARATOR)}`;

		const method_name = (node.callee as jsep.Identifier).name;
		return `${method_name}(${arguments_joined})`;
	}
	protected traverse_UnaryExpression(node: jsep.UnaryExpression): string {
		return `${node.operator}${this.traverse_node(node.argument)}`; // -5
	}

	protected traverse_Identifier(node: jsep.Identifier): string {
		return `${node.name}`;
	}
}
