import {ForLoopGlNode} from '../../../../src/engine/nodes/gl/ForLoop';

export function create_required_nodes_for_for_loop_gl_node(node: ForLoopGlNode) {
	const subnet_output1 = node.createNode('subnet_output');
	const subnet_input1 = node.createNode('subnet_input');
	return {subnet_input1, subnet_output1};
}
