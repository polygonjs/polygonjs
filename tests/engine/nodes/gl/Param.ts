import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';

QUnit.test('gl param updates its output type correctly when created', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const param1 = material_basic_builder1.createNode('param');

	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.FLOAT);

	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.test('gl param updates its output type correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const param1 = material_basic_builder1.createNode('param');
	assert.equal(param1.pv.type, 2);
	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.pv.type, 3);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const material_basic_builder2 = scene.node('/MAT/meshBasicBuilder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 3, 'new mat has 3 children');
	const param2 = material_basic_builder1.node('param1')!;
	assert.ok(param2);
	assert.equal(param2.pv.type, 3);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.skip('gl param updates it parent material with new spare parameters', async (assert) => {});
