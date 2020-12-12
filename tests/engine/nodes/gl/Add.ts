import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';

QUnit.test('gl add updates its output type correctly when created', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('mesh_basic_builder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');

	assert.equal(material_basic_builder1.children().length, 2);

	const add1 = material_basic_builder1.createNode('add');
	const constant1 = material_basic_builder1.createNode('constant');
	const constant2 = material_basic_builder1.createNode('constant');
	constant1.set_gl_type(GlConnectionPointType.VEC2);
	constant2.set_gl_type(GlConnectionPointType.VEC2);

	assert.equal(add1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.FLOAT);

	add1.set_input(0, constant1);
	assert.equal(add1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.VEC2);

	add1.set_input(1, constant2);
	assert.equal(add1.io.inputs.named_input_connection_points.length, 3);
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.VEC2);

	// remove inputs
	add1.set_input(1, null);
	assert.equal(add1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.VEC2);

	add1.set_input(0, null);
	assert.equal(add1.io.inputs.named_input_connection_points.length, 2);
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.FLOAT);

	// add inputs again to have one empty in the middle
	add1.set_input(0, constant1);
	add1.set_input(1, constant1);
	add1.set_input(2, constant2);
	assert.equal(add1.io.inputs.named_input_connection_points.length, 4, 'should be 4 connections when 3 inputs +++');
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.VEC2);
	add1.set_input(1, null);
	assert.equal(
		add1.io.inputs.named_input_connection_points.length,
		4,
		'should be 4 connections 2 inputs with one missing in the middle +-+'
	);
	assert.equal(add1.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.VEC2);
});

QUnit.test('gl add updates its output type correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('mesh_basic_builder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const add1 = material_basic_builder1.createNode('add');
	const constant1 = material_basic_builder1.createNode('constant');
	constant1.set_gl_type(GlConnectionPointType.VEC2);
	add1.set_input(0, constant1);
	assert.ok(add1.lifecycle.creation_completed);
	add1.params.get('add1')!.set([1, 2, 3]);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const material_basic_builder2 = scene.node('/MAT/mesh_basic_builder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 4, 'new mat has 4 children');
	const add2 = material_basic_builder1.node('add1')!;
	add2.set_input(0, constant1);
	assert.equal(add2.io.inputs.named_input_connection_points.length, 2);
	assert.equal(add2.io.inputs.named_input_connection_points[0].type, GlConnectionPointType.VEC2);
	assert.deepEqual(add2.params.get('add1')?.value_serialized, [1, 2]);
});
