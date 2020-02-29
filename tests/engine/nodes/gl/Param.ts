import {ConnectionPointType} from '../../../../src/engine/nodes/utils/connections/ConnectionPointType';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';

QUnit.test('gl param updates its output type correctly when created', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const param1 = material_basic_builder1.create_node('param');

	assert.equal(param1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(param1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.FLOAT);

	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(param1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.VEC2);
});

QUnit.test('gl param updates its output type correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.create_node('mesh_basic_builder');
	assert.equal(material_basic_builder1.children().length, 2);

	const param1 = material_basic_builder1.create_node('param');
	assert.equal(param1.pv.type, 2);
	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.pv.type, 3);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const material_basic_builder2 = scene.node('/MAT/mesh_basic_builder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 3, 'new mat has 3 children');
	const param2 = material_basic_builder1.node('param1')!;
	assert.ok(param2);
	assert.equal(param2.pv.type, 3);
	assert.equal(param1.io.outputs.named_output_connection_points.length, 1);
	assert.equal(param1.io.outputs.named_output_connection_points[0].type, ConnectionPointType.VEC2);
});

QUnit.skip('gl param updates it parent material with new spare parameters', async (assert) => {});
