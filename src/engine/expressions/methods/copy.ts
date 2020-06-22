import {BaseMethod} from './_Base';
import {MethodDependency} from '../MethodDependency';
import {CoreWalker} from '../../../core/Walker';
import {CopySopNode} from '../../nodes/sop/Copy';
import {BaseNodeType} from '../../nodes/_Base';

export class CopyExpression extends BaseMethod {
	protected _require_dependency = true;
	static required_arguments() {
		return [
			['string', 'path to copy'],
			['integer', 'default value'],
		];
	}
	static optional_arguments() {
		return [['string', 'attribute name (optional)']];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		const node = this.find_referenced_graph_node(index_or_path) as BaseNodeType;
		// I'd prefer testing with if(node instanceof CopySopNode)
		// but tslib generates an error when doing so
		if (node && node.type == 'copy') {
			const stamp_node = (node as CopySopNode).stamp_node;
			return this.create_dependency(stamp_node, index_or_path);
		}
		return null;
	}
	// find_dependencies(index_or_path: number|string): ReferenceSearchResult{
	// 	// return this.find_node_dependency_from_index_or_path(index_or_path)
	// 	const node = this.find_dependency_from_index_or_path(index_or_path)
	// 	return this.create_search_result(stamp_node, index_or_path)
	// }

	process_arguments(args: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			if (args.length == 2 || args.length == 3) {
				const path = args[0];
				const default_value = args[1];
				const attribute_name = args[2];

				const node = this.node ? CoreWalker.find_node(this.node, path) : null;

				let value;
				if (node && node.type == CopySopNode.type()) {
					value = (node as CopySopNode).stamp_value(attribute_name);
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
	// 	return this.jsep_node()._graph_node.add_graph_input( this.copy_sop.stamp_node() );
	// }

	// process_arguments(args, callback){
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
