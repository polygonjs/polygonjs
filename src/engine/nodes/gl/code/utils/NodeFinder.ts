import {AssemblerControllerNode} from '../Controller';

export class GlNodeFinder {
	static find_output_nodes(node: AssemblerControllerNode) {
		const output_nodes = node.nodes_by_type('output');
		// const param_nodes = this.find_param_nodes(node);
		// const nodes: BaseGlNodeType[] = [];
		// for (let output_node of output_nodes) {
		// 	nodes.push(output_node);
		// }
		// for (let param_node of param_nodes) {
		// 	nodes.push(param_node);
		// }
		return output_nodes;
	}
	static find_param_nodes(node: AssemblerControllerNode) {
		const nodes = node.nodes_by_type('param');
		return nodes;
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
