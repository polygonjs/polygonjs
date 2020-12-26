import {ForLoopGlNode} from '../../../../src/engine/nodes/gl/ForLoop';

export function create_required_nodes_for_forLoop_gl_node(node: ForLoopGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}
