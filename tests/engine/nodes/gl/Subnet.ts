import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';

export function create_required_nodes_for_subnet_gl_node(node: SubnetGlNode) {
	const subnet_output1 = node.createNode('subnet_output');
	const subnet_input1 = node.createNode('subnet_input');
	return {subnet_input1, subnet_output1};
}
