import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';

export function create_required_nodes_for_subnet_gl_node(node: SubnetGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}
