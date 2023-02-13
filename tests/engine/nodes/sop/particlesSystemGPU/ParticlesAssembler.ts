import {RendererUtils} from '../../../../helpers/RendererUtils';
import {AttribClass} from '../../../../../src/core/geometry/Constant';
import {MaterialUserDataUniforms} from '../../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {ShaderName} from '../../../../../src/engine/nodes/utils/shaders/ShaderName';
import {saveAndLoadScene} from '../../../../helpers/ImportHelper';
import {AssemblersUtils} from '../../../../helpers/AssemblersUtils';
import {AssertUtils} from '../../../../helpers/AssertUtils';
import {ParticlesSystemGpuSopNode} from '../../../../../src/engine/nodes/sop/ParticlesSystemGpu';
import {PointsBuilderMatNode} from '../../../../../src/engine/nodes/mat/PointsBuilder';
import {CoreSleep} from '../../../../../src/core/Sleep';
import {disposeParticlesFromNode} from '../../../../../src/core/particles/CoreParticles';
import {
	resetParticles,
	renderController,
	gpuController,
	createRequiredNodesForParticles,
	waitForParticlesComputedAndMounted,
	stepParticlesSimulation,
} from './ParticlesHelper';

QUnit.test('ParticlesSystemGPU: displays ok on first frame without assemblers', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);

	await scene.waitForCooksCompleted();
	const rendererData1 = await RendererUtils.waitForRenderer(scene);
	const renderer1 = rendererData1.renderer;
	assert.ok(renderer1, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0);
	const {output1, globals1, pointsBuilder1, actor1} = createRequiredNodesForParticles(particles1);
	assert.equal(particles1.children().length, 2);
	const add1 = particles1.createNode('add');
	add1.setInput(0, globals1, 'position');
	output1.setInput('position', add1);
	add1.params.get('add1')!.set([0, 0.1, 0]);

	delete1.setAttribClass(AttribClass.OBJECT);
	delete1.p.invert.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	actor1.setInput(0, delete1);
	particles1.p.preRollFramesCount.set(1);

	scene.setFrame(0);
	await particles1.compute();
	await waitForParticlesComputedAndMounted(particles1);
	await pointsBuilder1.compute();

	const render_material = renderController(particles1).material();
	assert.ok(render_material, 'mat ok');
	await RendererUtils.compile(pointsBuilder1, renderer1);
	const uniform = MaterialUserDataUniforms.getUniforms(render_material!)!.texture_position;
	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');
	const all_variables = gpuController(particles1).allVariables();
	assert.equal(all_variables.length, 1);

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = gpuController(particles1).getCurrentRenderTarget('position' as ShaderName)!;
	assert.ok(render_target1, 'render target ok');
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer1.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(AssertUtils.arrayWithPrecision(pixelBuffer), [-0.5, 0.1, -0.5, 0].join(':'), 'point start pos');

	stepParticlesSimulation(particles1);
	let render_target2 = gpuController(particles1).getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(
		AssertUtils.arrayWithPrecision(pixelBuffer),
		[-0.5, 0.2, -0.5, 0].join(':'),
		'point moved up on frame 1'
	);

	stepParticlesSimulation(particles1);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer1.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(
		AssertUtils.arrayWithPrecision(pixelBuffer),
		[-0.5, 0.3, -0.5, 0].join(':'),
		'point moved up on frame 2'
	);
	// if (1 + 1) return;
	scene.setFrame(0);
	disposeParticlesFromNode(particles1);
	await AssemblersUtils.withoutAssemblers(async () => {
		await saveAndLoadScene(scene, async (scene2) => {
			const rendererData2 = await RendererUtils.waitForRenderer(scene2);
			await scene2.waitForCooksCompleted();
			const renderer2 = rendererData2.renderer;

			const newPointsBuilder = scene2.node(pointsBuilder1.path()) as PointsBuilderMatNode;
			await newPointsBuilder.compute();
			const new_particles1 = scene2.node(particles1.path()) as ParticlesSystemGpuSopNode;
			assert.notOk(new_particles1.assemblerController(), 'no assembler when loading scene');
			assert.ok(new_particles1.persisted_config, 'persistedConfig ok');

			assert.equal(scene2.frame(), 0, 'start at frame 0');
			await resetParticles(new_particles1);
			await new_particles1.compute();
			await waitForParticlesComputedAndMounted(new_particles1);
			assert.notOk(new_particles1.states.error.message(), 'no error');
			const materialNode = new_particles1.pv.material.node()! as PointsBuilderMatNode;
			assert.ok(materialNode, 'materialNode ok');
			const pointsBuilder2 = await materialNode.material();
			assert.deepEqual(
				Object.keys(MaterialUserDataUniforms.getUniforms(pointsBuilder2) || {}).sort(),
				[],
				'the material from persisted config contains no uniform that may conflict with the not yet done compilation'
			);
			render_target1 = gpuController(new_particles1).getCurrentRenderTarget('position' as ShaderName)!;
			assert.ok(render_target1, 'render_target1 ok');
			renderer2.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
			assert.deepEqual(AssertUtils.arrayWithPrecision(pixelBuffer), [-0.5, 0.1, -0.5, 0].join(':'), 'start pos');

			stepParticlesSimulation(new_particles1);
			render_target2 = gpuController(new_particles1).getCurrentRenderTarget('position' as ShaderName)!;
			assert.ok(render_target2, 'render_target2 ok');
			renderer2.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
			assert.deepEqual(
				AssertUtils.arrayWithPrecision(pixelBuffer),
				[-0.5, 0.2, -0.5, 0].join(':'),
				'point with persisted config moved x'
			);

			await RendererUtils.compile(pointsBuilder2, renderer2);
			assert.deepEqual(
				Object.keys(MaterialUserDataUniforms.getUniforms(pointsBuilder2)!).sort(),
				[
					'diffuse',
					'opacity',
					'size',
					'scale',
					'map',
					'alphaMap',
					'alphaTest',
					'uvTransform',
					'fogDensity',
					'fogNear',
					'fogFar',
					'fogColor',
					'texture_position',
					'clippingPlanes',
				].sort(),
				'position uniform is preset in the material after compilation'
			);

			const key1 = pointsBuilder2.customProgramCacheKey();
			await CoreSleep.sleep(100);
			const key2 = pointsBuilder2.customProgramCacheKey();
			assert.equal(key1, key2);
			assert.includes(key1, pointsBuilder2.uuid);
			disposeParticlesFromNode(new_particles1);
		});
	});

	RendererUtils.dispose();
});
