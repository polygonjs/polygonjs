import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter, SceneJsonExporterData} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';

QUnit.test('gl add updates its output type correctly when created', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');

	assert.equal(material_basic_builder1.children().length, 2);

	const add1 = material_basic_builder1.createNode('add');
	const constant1 = material_basic_builder1.createNode('constant');
	const constant2 = material_basic_builder1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.VEC2);
	constant2.setGlType(GlConnectionPointType.VEC2);

	assert.equal(add1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.FLOAT);

	add1.setInput(0, constant1);
	assert.equal(add1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);

	add1.setInput(1, constant2);
	assert.equal(add1.io.inputs.namedInputConnectionPoints().length, 3);
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);

	// remove inputs
	add1.setInput(1, null);
	assert.equal(add1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);

	add1.setInput(0, null);
	assert.equal(add1.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.FLOAT);

	// add inputs again to have one empty in the middle
	add1.setInput(0, constant1);
	add1.setInput(1, constant1);
	add1.setInput(2, constant2);
	assert.equal(add1.io.inputs.namedInputConnectionPoints().length, 4, 'should be 4 connections when 3 inputs +++');
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
	add1.setInput(1, null);
	assert.equal(
		add1.io.inputs.namedInputConnectionPoints().length,
		4,
		'should be 4 connections 2 inputs with one missing in the middle +-+'
	);
	assert.equal(add1.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.test('gl add updates its output type correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const add1 = material_basic_builder1.createNode('add');
	const constant1 = material_basic_builder1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.VEC2);
	add1.setInput(0, constant1);
	assert.ok(add1.lifecycle.creationCompleted());
	add1.params.get('add1')!.set([1, 2, 3]);

	const data = await new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const material_basic_builder2 = scene2.node('/MAT/meshBasicBuilder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 4, 'new mat has 4 children');
	const add2 = material_basic_builder1.node('add1')!;
	// add2.setInput(0, constant1);
	assert.equal(add2.io.inputs.namedInputConnectionPoints().length, 2);
	assert.equal(add2.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
	assert.deepEqual(add2.params.get('add1')?.valueSerialized(), [1, 2]);
});

QUnit.test('gl add updates its output type correctly when scene is loaded 2', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const add1 = material_basic_builder1.createNode('add');
	const constant1 = material_basic_builder1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.VEC2);
	add1.setInput(0, constant1);
	add1.setInput(1, constant1);
	assert.ok(add1.lifecycle.creationCompleted());
	add1.params.get('add1')!.set([1, 2, 3]);

	let new_scene: PolyScene | undefined;
	for (let i = 0; i < 10; i++) {
		const data: SceneJsonExporterData = await new SceneJsonExporter(new_scene || scene).data();
		new_scene = await SceneJsonImporter.loadData(data);
		await new_scene.waitForCooksCompleted();
	}
	if (!new_scene) {
		throw 'should not return here';
		return;
	}

	const material_basic_builder2 = new_scene.node('/MAT/meshBasicBuilder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 4, 'new mat has 4 children');
	const add2 = material_basic_builder2.node('add1')!;
	assert.equal(add2.io.inputs.namedInputConnectionPoints().length, 3);
	assert.equal(add2.io.connections.inputConnections()!.length, 2);

	assert.equal(add2.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
	assert.deepEqual(add2.params.get('add1')?.valueSerialized(), [1, 2]);
});
