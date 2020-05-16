QUnit.test('gl if_then has child subnet_output disconnect if its own input is', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.create_node('constant');
	const if_then1 = material_basic_builder1.create_node('if_then');
	assert.equal(if_then1.io.outputs.named_output_connection_points.length, 1);

	assert.equal(if_then1.children().length, 2);
	const subnet_input1 = if_then1.nodes_by_type('subnet_input')[0];
	const subnet_output1 = if_then1.nodes_by_type('subnet_output')[0];
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
