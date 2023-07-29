import type {QUnit} from '../../../../helpers/QUnit';
import {AttribClass} from '../../../../../src/core/geometry/Constant';
import {MaterialUserDataUniforms} from '../../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {ParticlesSystemGpuSopNode} from '../../../../../src/engine/nodes/sop/ParticlesSystemGpu';
import {GlConnectionPointType} from '../../../../../src/engine/nodes/utils/io/connections/Gl';
import {ShaderName} from '../../../../../src/engine/nodes/utils/shaders/ShaderName';
import {Vector3Param} from '../../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../../helpers/AssemblersUtils';
import {AssertUtils} from '../../../../helpers/AssertUtils';
import {saveAndLoadScene} from '../../../../helpers/ImportHelper';
import {RendererUtils} from '../../../../helpers/RendererUtils';
import {disposeParticlesFromNode} from '../../../../../src/core/particles/CoreParticles';
import {
	resetParticles,
	gpuController,
	renderController,
	createRequiredNodesForParticles,
	waitForParticlesComputedAndMounted,
	stepParticlesSimulation,
} from './ParticlesHelper';
export function testenginenodessopparticlesSystemGPUParticlesPersistedConfig(qUnit: QUnit) {

qUnit.test('ParticlesSystemGPU with param and persisted_config', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	await scene.waitForCooksCompleted();
	const rendererData1 = await RendererUtils.waitForRenderer(window.scene);
	const renderer1 = rendererData1.renderer;
	assert.ok(renderer1, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0);
	const {output1, globals1, actor1, pointsBuilder1} = createRequiredNodesForParticles(particles1);
	assert.equal(particles1.children().length, 2);
	const add1 = particles1.createNode('add');
	const param1 = particles1.createNode('param');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('test_param');
	add1.setInput(0, globals1, 'position');
	add1.setInput(1, param1);
	output1.setInput('position', add1);

	plane1.p.size.set([2, 2]);
	plane1.p.useSegmentsCount.set(1);
	delete1.setAttribClass(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	actor1.setInput(0, delete1);

	scene.setFrame(1);
	particles1.p.preRollFramesCount.set(1);
	await particles1.compute();
	await waitForParticlesComputedAndMounted(particles1);
	assert.notOk(particles1.states.error.message(), 'no error (1)');
	const test_param = particles1.params.get('test_param')!;
	assert.ok(test_param, 'test_param is created');
	test_param.set([0, 1, 0]);
	const configRef = (await resetParticles(particles1))!;
	assert.ok(configRef, 'configRef is created');

	await particles1.compute();
	await waitForParticlesComputedAndMounted(particles1);
	assert.notOk(particles1.states.error.message(), 'no error (2)');

	const render_material = renderController(particles1).material()!;
	await RendererUtils.compile(pointsBuilder1, renderer1);
	const uniform = MaterialUserDataUniforms.getUniforms(render_material)!.texture_position;
	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');
	const all_variables = gpuController(particles1).allVariables();
	assert.equal(all_variables.length, 1);
	const variable = all_variables[0];
	const param_uniform = variable.material.uniforms.v_POLY_param_test_param;
	assert.deepEqual(param_uniform.value.toArray(), [0, 1, 0], 'param uniform set to the expected value');

	const buffer_width = 1;
	const buffer_height = 1;
	stepParticlesSimulation(particles1, configRef);
	let render_target1 = gpuController(particles1).getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer1.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 2, -1, 0].join(':'), 'point moved up');

	stepParticlesSimulation(particles1, configRef);
	let render_target2 = gpuController(particles1).getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 3, -1, 0].join(':'), 'point moved up');

	stepParticlesSimulation(particles1, configRef);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 4, -1, 0].join(':'), 'point moved up');

	test_param.set([0, 0.5, 0]);
	stepParticlesSimulation(particles1, configRef);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 4.5, -1, 0].join(':'), 'point moved up');

	test_param.set([0, 2, 0]);
	stepParticlesSimulation(particles1, configRef);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 6.5, -1, 0].join(':'), 'point moved up');

	test_param.set([1, 0, 0]);
	stepParticlesSimulation(particles1, configRef);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0, 6.5, -1, 0].join(':'), 'point moved up');

	scene.setFrame(1);
	disposeParticlesFromNode(particles1);
	await AssemblersUtils.withoutAssemblers(async () => {
		await saveAndLoadScene(scene, async (scene2) => {
			const rendererData2 = await RendererUtils.waitForRenderer(scene2);
			await scene2.waitForCooksCompleted();
			const renderer2 = rendererData2.renderer;

			const new_particles1 = scene2.node('/geo1/particlesSystemGpu1') as ParticlesSystemGpuSopNode;
			assert.notOk(new_particles1.assemblerController());
			assert.ok(new_particles1.persisted_config);
			const test_param2 = new_particles1.params.get('test_param') as Vector3Param;
			assert.ok(test_param2, 'spare param ok');

			assert.deepEqual(test_param2.value.toArray(), [1, 0, 0], 'test param is read back with expected value');
			assert.equal(scene2.frame(), 1);
			await new_particles1.compute();
			await waitForParticlesComputedAndMounted(new_particles1);
			const configRef2 = (await resetParticles(new_particles1))!;
			assert.ok(configRef2, 'configRef2 created');

			stepParticlesSimulation(particles1, configRef2);
			render_target1 = gpuController(new_particles1).getCurrentRenderTarget('position' as ShaderName)!;
			assert.ok(render_target1, 'render_target1 ok');
			renderer2.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
			assert.deepEqual(
				AssertUtils.arrayWithPrecision(pixelBuffer),
				[1, 0, -1, 0].join(':'),
				'point with persisted config moved x'
			);

			stepParticlesSimulation(particles1, configRef2);
			render_target2 = gpuController(new_particles1).getCurrentRenderTarget('position' as ShaderName)!;
			renderer2.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
			assert.deepEqual(
				AssertUtils.arrayWithPrecision(pixelBuffer),
				[2, 0, -1, 0].join(':'),
				'point with persisted config moved x'
			);

			test_param2.set([0, 2, 0]);
			stepParticlesSimulation(particles1, configRef2);
			render_target1 = gpuController(new_particles1).getCurrentRenderTarget('position' as ShaderName)!;
			renderer2.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
			assert.deepEqual(
				AssertUtils.arrayWithPrecision(pixelBuffer),
				[2, 2, -1, 0].join(':'),
				'point with persisted config moved y'
			);

			test_param2.set([-2, -4, -8]);
			stepParticlesSimulation(particles1, configRef2);
			render_target1 = gpuController(new_particles1).getCurrentRenderTarget('position' as ShaderName)!;
			renderer2.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
			assert.deepEqual(
				AssertUtils.arrayWithPrecision(pixelBuffer),
				[0, -2, -9, 0].join(':'),
				'point with persisted config moved in all axises'
			);
			disposeParticlesFromNode(new_particles1);
		});
	});

	RendererUtils.dispose();
});

}