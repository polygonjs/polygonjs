import {
	GL_CONNECTION_POINT_TYPES,
	GlConnectionPointType,
	BaseGlConnectionPoint,
} from '../../../../src/engine/nodes/utils/io/connections/Gl';

QUnit.test('gl mult default connections', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const mult1 = material_basic_builder1.createNode('mult');
	const constant1 = material_basic_builder1.createNode('constant');
	const constant2 = material_basic_builder1.createNode('constant');

	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);

	constant1.set_gl_type(GlConnectionPointType.FLOAT);
	constant2.set_gl_type(GlConnectionPointType.FLOAT);

	// float only
	mult1.setInput(0, constant1);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);
	assert.deepEqual(
		mult1.io.outputs.named_output_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT]
	);

	// float * float
	mult1.setInput(1, constant2);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);
	assert.deepEqual(
		mult1.io.outputs.named_output_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT]
	);

	// float * vec3
	constant2.set_gl_type(GlConnectionPointType.VEC3);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.VEC3]
	);
	assert.deepEqual(
		mult1.io.outputs.named_output_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.VEC3]
	);
});

QUnit.test('gl mult with empty input', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const mult1 = material_basic_builder1.createNode('mult');
	const constant1 = material_basic_builder1.createNode('constant');
	const constant2 = material_basic_builder1.createNode('constant');

	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);

	constant1.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT));
	constant2.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT));
	mult1.setInput(1, constant1);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);
});
