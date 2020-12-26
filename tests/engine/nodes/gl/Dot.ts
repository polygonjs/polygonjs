import {GlConnectionPointType, BaseGlConnectionPoint} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {BaseGlNodeType} from '../../../../src/engine/nodes/gl/_Base';

QUnit.test('gl dot updates its input and output types correctly', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.createNode('constant');
	const dot1 = material_basic_builder1.createNode('dot');

	// default inputs and outputs
	assert.equal(dot1.io.inputs.named_input_connection_points.length, 2);
	assert.deepEqual(
		dot1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type),
		[GlConnectionPointType.VEC3, GlConnectionPointType.VEC3]
	);
	assert.equal(dot1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(
		dot1.io.outputs.named_output_connection_points[0].type,
		GlConnectionPointType.FLOAT,
		'first type is float'
	);

	// plug a constant node with type vec2
	constant1.p.type.set(3);
	assert.equal(
		constant1.io.outputs.named_output_connection_points[0].type,
		GlConnectionPointType.VEC2,
		'first type is vec2'
	);
	dot1.setInput(0, constant1, 'val');
	assert.equal(dot1.io.inputs.named_input_connection_points.length, 2, '2 inputs');
	assert.deepEqual(
		dot1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type),
		[GlConnectionPointType.VEC2, GlConnectionPointType.VEC2],
		'types are vec2'
	);
	assert.equal(dot1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(dot1.io.outputs.named_output_connection_points[0].type, GlConnectionPointType.FLOAT);

	// change constant to float
	constant1.p.type.set(2);
	assert.equal(constant1.io.outputs.named_output_connection_points[0].type, GlConnectionPointType.FLOAT);
	dot1.setInput(0, constant1, 'val');
	assert.equal(dot1.io.inputs.named_input_connection_points.length, 2);
	assert.deepEqual(
		dot1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type),
		[GlConnectionPointType.VEC2, GlConnectionPointType.VEC2]
	);
	assert.equal(dot1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(dot1.io.outputs.named_output_connection_points[0].type, GlConnectionPointType.FLOAT);
});

QUnit.test('gl dot updates its output type and param correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const constant1 = material_basic_builder1.createNode('constant');
	const dot1 = material_basic_builder1.createNode('dot');
	constant1.p.type.set(3);
	assert.equal(constant1.io.outputs.named_output_connection_points[0].type, GlConnectionPointType.VEC2);
	dot1.setInput(0, constant1, 'val');
	dot1.params.get('vec1')!.set([1, 2]);

	await scene.wait_for_cooks_completed();
	const data = new SceneJsonExporter(scene).data();

	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const dot2 = scene2.node('/MAT/meshBasicBuilder1/dot1')! as BaseGlNodeType;
	const input_connection_points = dot2.io.inputs.named_input_connection_points;
	assert.deepEqual(
		input_connection_points.map((c) => c.type),
		[GlConnectionPointType.VEC2, GlConnectionPointType.VEC2]
	);
	assert.deepEqual(dot2.params.get('vec1')!.value_serialized, [1, 2]);
});
