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
 *
 */
import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {CoreWalker} from '../../../core/Walker';
import {CopySopNode} from '../../nodes/sop/Copy';
import {CopyAnimNode} from '../../nodes/anim/Copy';
import {BaseNodeType} from '../../nodes/_Base';

type CopyNode = CopyAnimNode | CopySopNode;
export class CopyExpression extends BaseMethod {
	protected _require_dependency = true;
	static requiredArguments() {
		return [
			['string', 'path to copy'],
			['integer', 'default value'],
		];
	}
	static optionalArguments() {
		return [['string', 'attribute name (optional)']];
	}

	findDependency(index_or_path: number | string): MethodDependency | null {
		const node = this.findReferencedGraphNode(index_or_path) as BaseNodeType;
		// I'd prefer testing with if(node instanceof CopySopNode || node instanceof CopyAnimNode)
		// but tslib generates an error when doing so
		if (node && node.type() == 'copy') {
			const stampNode = (node as CopyNode).stampNode();
			return this.createDependency(stampNode, index_or_path);
		}
		return null;
	}
	// find_dependencies(index_or_path: number|string): ReferenceSearchResult{
	// 	// return this.find_node_dependency_from_index_or_path(index_or_path)
	// 	const node = this.find_dependency_from_index_or_path(index_or_path)
	// 	return this.create_search_result(stampNode, index_or_path)
	// }

	processArguments(args: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			if (args.length == 2 || args.length == 3) {
				const path = args[0];
				const default_value = args[1];
				const attribute_name = args[2];

				const current_node = this.node();
				const node = current_node ? CoreWalker.findNode(current_node, path) : null;

				let value;
				if (node && node.type() == CopySopNode.type()) {
					value = (node as CopySopNode).stampValue(attribute_name);
				}
				// if (node && node instanceof CopySopNode) {
				// 	value = node.stamp_value(attribute_name);
				// }

				if (value == null) {
					value = default_value;
				}
				resolve(value);
			} else {
				resolve(0);
			}
		});
	}
	// update_dependencies() {
	// 	return this.jsep_node()._graph_node.addGraphInput( this.copy_sop.stampNode() );
	// }

	// processArguments(args, callback){
	// 	const path = args[0];
	// 	const default_value = args[1];
	// 	const attribute_name = args[2];

	// 	this.copy_sop = Walker.find_node(this.node(), path);
	// 	let value = (this.copy_sop != null) ?
	// 		this.copy_sop.stamp_value(attribute_name) : undefined;

	// 	if (value == null) { value = default_value; }

	// 	return callback(value);
	// }
}
