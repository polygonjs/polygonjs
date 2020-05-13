import {AssemblerControllerNode} from '../Controller';
import {BaseGlNodeType} from '../../_Base';

export class GlNodeFinder {
	static find_output_nodes(node: AssemblerControllerNode) {
		const output_nodes = node.nodes_by_type('output');
		return output_nodes;
	}
	static find_param_generating_nodes(node: AssemblerControllerNode) {
		const param_nodes: BaseGlNodeType[] = node.nodes_by_type('param');
		const texture_nodes = node.nodes_by_type('texture');
		const ramp_nodes = node.nodes_by_type('ramp');
		const all = param_nodes.concat(texture_nodes).concat(ramp_nodes);
		return all;
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
