import {GlRotateMode} from '../../../../src/engine/nodes/gl/Rotate';

QUnit.test('gl rotate has his input updated when mode changes', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('mesh_basic_builder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.createNode('constant');
	const rotate1 = material_basic_builder1.createNode('rotate');

	rotate1.set_signature(GlRotateMode.AXIS);
	assert.equal(rotate1.io.inputs.named_input_connection_points.length, 3);
	rotate1.set_signature(GlRotateMode.QUAT);
	assert.equal(rotate1.io.inputs.named_input_connection_points.length, 2);

	rotate1.set_signature(GlRotateMode.AXIS);
	assert.equal(rotate1.io.inputs.named_input_connection_points.length, 3);

	rotate1.set_input(2, constant1);
	assert.ok(rotate1.io.inputs.input(2));
	assert.equal(rotate1.io.inputs.input(2)?.graph_node_id, constant1.graph_node_id);

	// check that the input is removed
	rotate1.set_signature(GlRotateMode.QUAT);
	assert.notOk(rotate1.io.inputs.input(2));
});

QUnit.test('gl rotate is created with correct defaults', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('mesh_basic_builder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const rotate1 = material_basic_builder1.createNode('rotate');
	assert.deepEqual(rotate1.p.vector.value_serialized, [0, 0, 1]);
	assert.deepEqual(rotate1.p.axis.value_serialized, [0, 1, 0]);
});
