import {BaseGlParentNode} from '../Controller';
import {BaseGlNodeType} from '../../_Base';

export class GlNodeFinder {
	static find_output_nodes(node: BaseGlParentNode) {
		const output_nodes = node.nodes_by_type('output');
		return output_nodes;
	}
	static find_param_generating_nodes(node: BaseGlParentNode) {
		const param_nodes: BaseGlNodeType[] = node.nodes_by_type('param');
		const texture_nodes = node.nodes_by_type('texture');
		const ramp_nodes = node.nodes_by_type('ramp');
		let all = param_nodes.concat(texture_nodes).concat(ramp_nodes);

		const if_then_nodes: BaseGlParentNode[] = node.nodes_by_type('if_then');
		for (let if_then_node of if_then_nodes) {
			all = all.concat(this.find_param_generating_nodes(if_then_node));
		}

		return all;
	}
	static find_attribute_export_nodes(node: BaseGlParentNode) {
		const nodes = node.nodes_by_type('attribute');
		return nodes.filter((node) => {
			// do not use attributes that are used as an input, as export
			// return (node.used_output_names().length == 0) &&
			return node.is_exporting;
		});
	}
}
