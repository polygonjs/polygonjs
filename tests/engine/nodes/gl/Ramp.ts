import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('gl ramp updates its parent material with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
	const ramp1 = meshBasicBuilder1.createNode('ramp');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'ramp1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.RAMP);

	// change name
	ramp1.p.name.set('customRamp');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'customRamp');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.RAMP);

	// remove
	meshBasicBuilder1.removeNode(ramp1);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
});

QUnit.test('gl ramp updates its parent cop builder with new spare parameters', async (assert) => {
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
	const ramp1 = builder1.createNode('ramp');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'ramp1');
	assert.equal(builder1.params.spare[0].type(), ParamType.RAMP);

	// change name
	ramp1.p.name.set('customRamp');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'customRamp');
	assert.equal(builder1.params.spare[0].type(), ParamType.RAMP);

	// remove
	builder1.removeNode(ramp1);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
});

QUnit.test('gl ramp updates its particles system with new spare parameters', async (assert) => {
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
	const ramp1 = particlesSystemGpu1.createNode('ramp');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'ramp1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.RAMP);

	// change name
	ramp1.p.name.set('customRamp');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'customRamp');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.RAMP);

	// remove
	particlesSystemGpu1.removeNode(ramp1);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
});
