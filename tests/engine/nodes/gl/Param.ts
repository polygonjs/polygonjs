import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('gl param updates its output type correctly when created', async (assert) => {
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	assert.equal(meshBasicBuilder1.children().length, 2);

	const param1 = meshBasicBuilder1.createNode('param');

	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.FLOAT);

	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.test('gl param updates its output type correctly when scene is loaded', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	assert.equal(meshBasicBuilder1.children().length, 2);

	const param1 = meshBasicBuilder1.createNode('param');
	assert.equal(param1.pv.type, 2);
	param1.p.type.set(param1.pv.type + 1);
	assert.equal(param1.pv.type, 3);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const material_basic_builder2 = scene.node('/MAT/meshBasicBuilder1')!;
	assert.ok(material_basic_builder2);
	assert.equal(material_basic_builder2.children().length, 3, 'new mat has 3 children');
	const param2 = meshBasicBuilder1.node('param1')!;
	assert.ok(param2);
	assert.equal(param2.pv.type, 3);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints().length, 1);
	assert.equal(param1.io.outputs.namedOutputConnectionPoints()[0].type(), GlConnectionPointType.VEC2);
});

QUnit.test('gl param updates its parent material with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
	const param1 = meshBasicBuilder1.createNode('param');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.FLOAT);

	// change type
	param1.setGlType(GlConnectionPointType.VEC3);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 4);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.VECTOR3);
	param1.setGlType(GlConnectionPointType.VEC2);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 3);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.VECTOR2);
	param1.setGlType(GlConnectionPointType.VEC4);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 5);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.VECTOR4);
	param1.setGlType(GlConnectionPointType.BOOL);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.BOOLEAN);
	param1.setGlType(GlConnectionPointType.INT);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'param1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.INTEGER);

	// change name
	param1.p.name.set('customParam');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'customParam');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.INTEGER);

	// remove
	meshBasicBuilder1.removeNode(param1);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
});

QUnit.test('gl param updates its parent cop builder with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');
	const COP = window.COP;
	const builder1 = COP.createNode('builder');
	builder1.createNode('output');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
	const param1 = builder1.createNode('param');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.FLOAT);

	// change type
	param1.setGlType(GlConnectionPointType.VEC3);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 4);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.VECTOR3);
	param1.setGlType(GlConnectionPointType.VEC2);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 3);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.VECTOR2);
	param1.setGlType(GlConnectionPointType.VEC4);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 5);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.VECTOR4);
	param1.setGlType(GlConnectionPointType.BOOL);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.BOOLEAN);
	param1.setGlType(GlConnectionPointType.INT);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'param1');
	assert.equal(builder1.params.spare[0].type(), ParamType.INTEGER);

	// change name
	param1.p.name.set('customParam');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'customParam');
	assert.equal(builder1.params.spare[0].type(), ParamType.INTEGER);

	// remove
	builder1.removeNode(param1);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
});

QUnit.test('gl param updates its particles system with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');
	const geo1 = window.geo1;
	const particlesSystemGpu1 = geo1.createNode('particlesSystemGpu');
	const plane = geo1.createNode('plane');
	particlesSystemGpu1.setInput(0, plane);
	particlesSystemGpu1.createNode('output');
	particlesSystemGpu1.flags.display.set(true);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
	const param1 = particlesSystemGpu1.createNode('param');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.FLOAT);

	// change type
	param1.setGlType(GlConnectionPointType.VEC3);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 4);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.VECTOR3);
	param1.setGlType(GlConnectionPointType.VEC2);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 3);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.VECTOR2);
	param1.setGlType(GlConnectionPointType.VEC4);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 5);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.VECTOR4);
	param1.setGlType(GlConnectionPointType.BOOL);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.BOOLEAN);
	param1.setGlType(GlConnectionPointType.INT);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'param1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.INTEGER);

	// change name
	param1.p.name.set('customParam');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'customParam');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.INTEGER);

	// remove
	particlesSystemGpu1.removeNode(param1);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
});
