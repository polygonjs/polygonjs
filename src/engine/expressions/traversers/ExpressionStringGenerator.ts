import {BaseParamType} from '../../params/_Base';
import {ParsedTree} from './ParsedTree';
import jsep from 'jsep';

const ARGUMENTS_SEPARATOR = ', ';

import {BaseTraverser} from './_Base';

export class ExpressionStringGenerator extends BaseTraverser {
	constructor(public override param: BaseParamType) {
		super(param);
	}

	parseTree(parsedTree: ParsedTree) {
		const node = parsedTree.node();
		if (parsedTree.errorMessage() == null && node) {
			try {
				return this.traverse_node(node);
			} catch (e) {
				this.setError('could not traverse tree');
			}
		} else {
			this.setError('cannot parse tree');
		}
	}

	protected traverse_CallExpression(node: jsep.CallExpression): string {
		const methodArguments = node.arguments.map((arg) => {
			return this.traverse_node(arg);
		});
		const argumentsJoined = `${methodArguments.join(ARGUMENTS_SEPARATOR)}`;

		const methodName = (node.callee as jsep.Identifier).name;
		return `${methodName}(${argumentsJoined})`;
	}
	protected traverse_UnaryExpression(node: jsep.UnaryExpression): string {
		return `${node.operator}${this.traverse_node(node.argument)}`; // -5
	}

	protected traverse_Identifier(node: jsep.Identifier): string {
		return `${node.name}`;
	}
}
