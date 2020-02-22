import {AssemblerControllerNode} from '../Controller';

export class GlNodeFinder {
	static find_output_nodes(node: AssemblerControllerNode) {
		const nodes = node.nodes_by_type('output');
		return nodes;
		// if (nodes.length > 1) {
		// 	node.states.error.set('only one output node allowed');
		// }
		// return nodes[0];
	}
	static find_attribute_export_nodes(node: AssemblerControllerNode) {
		const nodes = node.nodes_by_type('attribute');
		return nodes.filter((node) => {
			// do not use attributes that are used as an input, as export
			// return (node.used_output_names().length == 0) &&
			return node.is_exporting;
		});
	}
}
