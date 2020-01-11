import {BaseMethod} from './_Base';
import {BaseNode} from 'src/engine/nodes/_Base';
import {MethodDependency} from '../MethodDependency';
// import Walker from 'src/core/Walker';
import {CoreString} from 'src/core/String';
// import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

export class Opdigits extends BaseMethod {
	static required_arguments() {
		return [['string', 'path to node']];
	}

	find_dependency(index_or_path: number | string): MethodDependency | null {
		const node = this.find_referenced_graph_node(index_or_path);
		if (node) {
			if (node instanceof BaseNode) {
				const name_node = node.name_controller.graph_node;
				return this.create_dependency(name_node, index_or_path);
			}
		}
		return null;
		// return [this.create_dependency_from_index_or_path(index_or_path)]
	}
	// find_dependencies(index_or_path: number|string): ReferenceSearchResult{

	// 	// TODO: ensure the dependency update works for space params when they get renamed
	// 	console.log(node)
	// 	const name_node = node.name_graph_node()
	// 	return this.create_search_result(name_node, index_or_path)
	// 	// return this.create_reference_search_result_from_index_or_path(index_or_path)
	// }

	process_arguments(args: any[]): Promise<any> {
		return new Promise((resolve, reject) => {
			if (args.length == 1) {
				const index_or_path = args[0];
				const node = this.get_referenced_node(index_or_path);
				if (node) {
					const name = node.name;
					const value = CoreString.tail_digits(name);
					resolve(value);
				} else {
					resolve(0);
				}
			} else {
				resolve(0);
			}
		});
	}
}
