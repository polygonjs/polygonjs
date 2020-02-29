import {ConnectionPointType} from '../../../../src/engine/nodes/utils/connections/ConnectionPointType';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';

QUnit.test('gl dot updates its input and output types correctly', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.create_node('constant');
	const dot1 = material_basic_builder1.create_node('dot');

	// default inputs and outputs
	assert.equal(dot1.io.inputs.named_input_connection_points.length, 2);
	assert.deepEqual(
		dot1.io.inputs.named_input_connection_points.map((c) => c.type),
		[ConnectionPointType.VEC3, ConnectionPointType.VEC3]
	);
	assert.equal(dot1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(dot1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.FLOAT);

	// plug a constant node with type vec2
	constant1.p.type.set(3);
	assert.equal(constant1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.VEC2);
	dot1.set_input(0, constant1, 'val');
	assert.equal(dot1.io.inputs.named_input_connection_points.length, 2);
	assert.deepEqual(
		dot1.io.inputs.named_input_connection_points.map((c) => c.type),
		[ConnectionPointType.VEC2, ConnectionPointType.VEC2]
	);
	assert.equal(dot1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(dot1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.FLOAT);

	// change constant to float
	constant1.p.type.set(2);
	assert.equal(constant1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.FLOAT);
	dot1.set_input(0, constant1, 'val');
	assert.equal(dot1.io.inputs.named_input_connection_points.length, 2);
	assert.deepEqual(
		dot1.io.inputs.named_input_connection_points.map((c) => c.type),
		[ConnectionPointType.VEC2, ConnectionPointType.VEC2]
	);
	assert.equal(dot1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(dot1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.FLOAT);
});

QUnit.test('gl dot updates its output type and param correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.create_node('constant');
	const dot1 = material_basic_builder1.create_node('dot');
	constant1.p.type.set(3);
	assert.equal(constant1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.VEC2);
	dot1.set_input(0, constant1, 'val');
	dot1.params.get('vec1')!.set([1, 2]);

	await scene.wait_for_cooks_completed();
	const data = new SceneJsonExporter(scene).data();

	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const dot2 = scene2.node('/MAT/mesh_basic_builder1/dot1')!;
	assert.deepEqual(
		dot2.io.inputs.named_input_connection_points.map((c) => c.type),
		[ConnectionPointType.VEC2, ConnectionPointType.VEC2]
	);
	assert.deepEqual(dot2.params.get('vec1')!.value_serialized, [1, 2]);
});
