import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {SceneJsonExporter, SceneJsonExporterData} from '../../../../src/engine/io/json/export/Scene';
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
		mult1.io.inputs.namedInputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);

	constant1.set_gl_type(GlConnectionPointType.FLOAT);
	constant2.set_gl_type(GlConnectionPointType.FLOAT);

	// float only
	mult1.setInput(0, constant1);
	assert.deepEqual(
		mult1.io.inputs.namedInputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);
	assert.deepEqual(
		mult1.io.outputs.namedOutputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT]
	);

	// float * float
	mult1.setInput(1, constant2);
	assert.deepEqual(
		mult1.io.inputs.namedInputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);
	assert.deepEqual(
		mult1.io.outputs.namedOutputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT]
	);

	// float * vec3
	constant2.set_gl_type(GlConnectionPointType.VEC3);
	assert.deepEqual(
		mult1.io.inputs.namedInputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.VEC3]
	);
	assert.deepEqual(
		mult1.io.outputs.namedOutputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
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
		mult1.io.inputs.namedInputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);

	constant1.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT));
	constant2.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT));
	mult1.setInput(1, constant1);
	assert.deepEqual(
		mult1.io.inputs.namedInputConnectionPoints().map((c: BaseGlConnectionPoint) => c.type()),
		[GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT]
	);
});

QUnit.test('gl mult updates its output type correctly when scene is loaded 2', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const mult1 = material_basic_builder1.createNode('mult');
	const constant1 = material_basic_builder1.createNode('constant');
	constant1.set_gl_type(GlConnectionPointType.VEC2);
	mult1.setInput(0, constant1);
	mult1.setInput(1, constant1);
	assert.ok(mult1.lifecycle.creationCompleted());
	mult1.params.get('mult1')!.set([1, 2, 3]);

	let new_scene: PolyScene | undefined;
	for (let i = 0; i < 10; i++) {
		const data: SceneJsonExporterData = new SceneJsonExporter(new_scene || scene).data();
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
	const mult2 = material_basic_builder2.node('mult1')!;
	assert.equal(mult2.io.inputs.namedInputConnectionPoints().length, 3);
	assert.equal(mult2.io.connections.inputConnections()!.length, 2);

	assert.equal(mult2.io.inputs.namedInputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
	assert.deepEqual(mult2.params.get('mult1')?.valueSerialized(), [1, 2]);
});
