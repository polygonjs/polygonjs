import {ParamType} from '../../../../src/engine/poly/ParamType';
import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('gl texture updates it parent material with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
	const texture1 = meshBasicBuilder1.createNode('texture');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'texture1');
	assert.equal(meshBasicBuilder1.params.spare[0].type(), ParamType.NODE_PATH);

	// change name
	texture1.p.paramName.set('customTexture');
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 1);
	assert.equal(meshBasicBuilder1.params.spare[0].name(), 'customTexture');

	// remove
	meshBasicBuilder1.removeNode(texture1);
	await meshBasicBuilder1.compute();
	assert.equal(meshBasicBuilder1.params.spare.length, 0);
});

QUnit.test('gl texture updates it parent cop builder with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const COP = window.COP;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');
	const builder1 = COP.createNode('builder');
	builder1.createNode('output');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
	const texture1 = builder1.createNode('texture');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'texture1');
	assert.equal(builder1.params.spare[0].type(), ParamType.NODE_PATH);

	// change name
	texture1.p.paramName.set('customTexture');
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 1);
	assert.equal(builder1.params.spare[0].name(), 'customTexture');

	// remove
	builder1.removeNode(texture1);
	await builder1.compute();
	assert.equal(builder1.params.spare.length, 0);
});

QUnit.test('gl texture updates it particle system with new spare parameters', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const geo1 = window.geo1;
	const particlesSystemGpu1 = geo1.createNode('particlesSystemGpu');
	const plane = geo1.createNode('plane');
	particlesSystemGpu1.setInput(0, plane);
	particlesSystemGpu1.createNode('output');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
	const texture1 = particlesSystemGpu1.createNode('texture');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'texture1');
	assert.equal(particlesSystemGpu1.params.spare[0].type(), ParamType.NODE_PATH);

	// change name
	texture1.p.paramName.set('customTexture');
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 1);
	assert.equal(particlesSystemGpu1.params.spare[0].name(), 'customTexture');

	// remove
	particlesSystemGpu1.removeNode(texture1);
	await particlesSystemGpu1.compute();
	assert.equal(particlesSystemGpu1.params.spare.length, 0);
});

QUnit.test('gl texture generates an error on material if no name is given', async (assert) => {
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const COP = window.COP;
	const scene = window.scene;

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	function createParticles() {
		const plane = geo1.createNode('plane');
		const particles = geo1.createNode('particlesSystemGpu');
		particles.setInput(0, plane);
		const mat = MAT.createNode('meshBasicBuilder');
		particles.p.material.setNode(mat);
		return particles;
	}
	const builderNodes = [
		MAT.createNode('meshBasicBuilder'),
		MAT.createNode('meshLambertBuilder'),
		MAT.createNode('meshPhongBuilder'),
		MAT.createNode('meshStandardBuilder'),
		MAT.createNode('meshPhysicalBuilder'),
		MAT.createNode('volumeBuilder'),
		createParticles(),
		COP.createNode('builder'),
	];
	async function runTest() {
		for (let builderNode of builderNodes) {
			assert.equal(builderNode.nodesByType('output').length, 0);
			await builderNode.compute();
			assert.equal(builderNode.states.error.message(), 'one output node is required');

			builderNode.createNode('output');
			await builderNode.compute();
			assert.notOk(
				builderNode.states.error.message(),
				'error message has disappeared as we have one output node'
			);

			const tex = builderNode.createNode('texture');
			tex.p.paramName.set('');
			await builderNode.compute();
			assert.equal(
				builderNode.states.error.message(),
				'texture1 cannot create spare parameter',
				builderNode.path()
			);
			tex.p.paramName.set(tex.name());
			await builderNode.compute();
			assert.notOk(builderNode.states.error.message());
		}
	}
	const displayConsoleOutput = false;
	if (displayConsoleOutput) {
		runTest();
	} else {
		await checkConsolePrints(runTest);
	}
});
