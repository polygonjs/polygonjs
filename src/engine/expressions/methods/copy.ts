import {BaseMethodFindDependencyArgs} from './_Base';
/**
 * The copy expression allows the copy SOP node to evaluates its input graph multiple times, and vary its result each time.
 *
 * @remarks
 * It takes 2 or 3 arguments
 *
 * copy(<input_index_or_node_path\>, <default_value/>, <attribute_name/>)
 *
 * - **<input_index_or_node_path\>** is a number or a string
 * - **<default_value\>** is a number
 * - **<attribute_name\>** is the attribute that will be stamped
 *
 * ## Usage
 *
 * - `copy('../copy1', 0, 'i')` - returns the index of each evaluation
 * - `copy('../copy1', 0)` - returns the index of each evaluation
 * - `copy('../copy1')` - returns the index of each evaluation
 *
 */
import {SopType} from './../../poly/registers/nodes/types/Sop';
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {CoreWalker} from '../../../core/Walker';
import type {CopySopNode} from '../../nodes/sop/Copy';
import type {CopyAnimNode} from '../../nodes/anim/Copy';
import {BaseNodeType} from '../../nodes/_Base';
import {AnimType} from '../../poly/registers/nodes/types/Anim';

type CopyNode = CopyAnimNode | CopySopNode;

function isCopyNode(node?: BaseNodeType | null) {
	return node && node.type() == SopType.COPY && node.type() == AnimType.COPY;
}
export class CopyExpression extends BaseMethod {
	protected override _requireDependency = true;
	static override requiredArguments() {
		return [
			['string', 'path to copy'],
			['integer', 'default value'],
		];
	}
	static override optionalArguments() {
		return [['string', 'attribute name (optional)']];
	}

	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		if (args.indexOrPath == null) {
			return null;
		}
		const node = this.findReferencedGraphNode(args.indexOrPath) as BaseNodeType;
		// I'd prefer testing with if(node instanceof CopySopNode || node instanceof CopyAnimNode)
		// but tslib generates an error when doing so
		if (isCopyNode(node)) {
			const stampNode = (node as CopyNode).stampNode();
			return this.createDependency(stampNode, {indexOrPath: args.indexOrPath});
		}
		return null;
	}

	override processArguments(args: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			if (args.length >= 1) {
				const path = args[0];
				const defaultValue = args[1] || 0;
				const attributeName = args[2];

				const currentNode = this.node();
				const node = currentNode ? CoreWalker.findNode(currentNode, path) : null;

				let value;
				if (isCopyNode(node)) {
					value = (node as CopySopNode).stampValue(attributeName);
				}
				if (value == null) {
					value = defaultValue;
				}
				resolve(value);
			} else {
				resolve(0);
			}
		});
	}
}
