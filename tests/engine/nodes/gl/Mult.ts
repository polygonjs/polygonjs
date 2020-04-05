import {
	ConnectionPointTypes,
	ConnectionPointType,
} from '../../../../src/engine/nodes/utils/connections/ConnectionPointType';
import {BaseNamedConnectionPointType} from '../../../../src/engine/nodes/utils/connections/NamedConnectionPoint';

QUnit.test('gl mult default connections', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const mult1 = material_basic_builder1.create_node('mult');
	const constant1 = material_basic_builder1.create_node('constant');
	const constant2 = material_basic_builder1.create_node('constant');

	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT, ConnectionPointType.FLOAT]
	);

	constant1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));
	constant2.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));

	// float only
	mult1.set_input(0, constant1);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT, ConnectionPointType.FLOAT]
	);
	assert.deepEqual(
		mult1.io.outputs.named_output_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT]
	);

	// float * float
	mult1.set_input(1, constant2);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT, ConnectionPointType.FLOAT, ConnectionPointType.FLOAT]
	);
	assert.deepEqual(
		mult1.io.outputs.named_output_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT]
	);

	// float * vec3
	console.log('*** updating constant');
	constant2.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.VEC3));
	console.log('*** check');
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT, ConnectionPointType.VEC3]
	);
	assert.deepEqual(
		mult1.io.outputs.named_output_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.VEC3]
	);
});

QUnit.test('gl mult with empty input', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const mult1 = material_basic_builder1.create_node('mult');
	const constant1 = material_basic_builder1.create_node('constant');
	const constant2 = material_basic_builder1.create_node('constant');

	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT, ConnectionPointType.FLOAT]
	);

	constant1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));
	constant2.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));
	mult1.set_input(1, constant1);
	assert.deepEqual(
		mult1.io.inputs.named_input_connection_points.map((c: BaseNamedConnectionPointType) => c.type),
		[ConnectionPointType.FLOAT, ConnectionPointType.FLOAT]
	);
});
