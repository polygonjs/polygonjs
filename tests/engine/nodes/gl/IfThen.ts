import {IfThenGlNode} from '../../../../src/engine/nodes/gl/IfThen';

export function create_required_nodes_for_ifThen_gl_node(node: IfThenGlNode) {
	const subnetOutput1 = node.createNode('subnetOutput');
	const subnetInput1 = node.createNode('subnetInput');
	return {subnetInput1, subnetOutput1};
}

QUnit.test('gl ifThen has child subnetOutput disconnect if its own input is', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.createNode('constant');
	const ifThen1 = material_basic_builder1.createNode('ifThen');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_ifThen_gl_node(ifThen1);
	assert.equal(ifThen1.io.outputs.named_output_connection_points.length, 1);

	assert.equal(ifThen1.children().length, 2);
	assert.equal(subnetInput1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(subnetOutput1.io.inputs.named_input_connection_points.length, 1);

	// the subnetInput updates its inputs if we plug a node to the ifThen
	ifThen1.setInput(1, constant1);
	assert.equal(subnetInput1.io.outputs.named_output_connection_points.length, 2);
	assert.equal(subnetOutput1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(ifThen1.io.inputs.named_input_connection_points.length, 3);
	assert.equal(ifThen1.io.outputs.named_output_connection_points.length, 2);

	// the if has an output connection point if we connect the subnetOutput
	subnetOutput1.setInput(0, subnetInput1);
	assert.equal(subnetInput1.io.outputs.named_output_connection_points.length, 2);
	assert.equal(subnetOutput1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(ifThen1.io.inputs.named_input_connection_points.length, 3);
	assert.equal(ifThen1.io.outputs.named_output_connection_points.length, 2);

	// and if we disconnect the ifThen inputs, they all update
	ifThen1.setInput(1, null);
	assert.equal(subnetInput1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(subnetOutput1.io.inputs.named_input_connection_points.length, 1);
	assert.equal(ifThen1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(ifThen1.io.outputs.named_output_connection_points.length, 1);
});
