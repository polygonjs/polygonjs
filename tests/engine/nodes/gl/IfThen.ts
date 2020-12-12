import {IfThenGlNode} from '../../../../src/engine/nodes/gl/IfThen';

export function create_required_nodes_for_if_then_gl_node(node: IfThenGlNode) {
	const subnet_output1 = node.createNode('subnet_output');
	const subnet_input1 = node.createNode('subnet_input');
	return {subnet_input1, subnet_output1};
}

QUnit.test('gl if_then has child subnet_output disconnect if its own input is', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('mesh_basic_builder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.createNode('constant');
	const if_then1 = material_basic_builder1.createNode('if_then');
	const {subnet_input1, subnet_output1} = create_required_nodes_for_if_then_gl_node(if_then1);
	assert.equal(if_then1.io.outputs.named_output_connection_points.length, 1);

	assert.equal(if_then1.children().length, 2);
	assert.equal(subnet_input1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(subnet_output1.io.inputs.named_input_connection_points.length, 1);

	// the subnet_input updates its inputs if we plug a node to the if_then
	if_then1.set_input(1, constant1);
	assert.equal(subnet_input1.io.outputs.named_output_connection_points.length, 2);
	assert.equal(subnet_output1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(if_then1.io.inputs.named_input_connection_points.length, 3);
	assert.equal(if_then1.io.outputs.named_output_connection_points.length, 2);

	// the if has an output connection point if we connect the subnet_output
	subnet_output1.set_input(0, subnet_input1);
	assert.equal(subnet_input1.io.outputs.named_output_connection_points.length, 2);
	assert.equal(subnet_output1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(if_then1.io.inputs.named_input_connection_points.length, 3);
	assert.equal(if_then1.io.outputs.named_output_connection_points.length, 2);

	// and if we disconnect the if_then inputs, they all update
	if_then1.set_input(1, null);
	assert.equal(subnet_input1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(subnet_output1.io.inputs.named_input_connection_points.length, 1);
	assert.equal(if_then1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(if_then1.io.outputs.named_output_connection_points.length, 1);
});
