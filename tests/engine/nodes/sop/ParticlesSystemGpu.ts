import {RendererUtils} from '../../../helpers/RendererUtils';
import {ShaderName} from '../../../../src/engine/nodes/utils/shaders/ShaderName';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {ParticlesSystemGpuSopNode} from '../../../../src/engine/nodes/sop/ParticlesSystemGpu';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssertUtils} from '../../../helpers/AssertUtils';

function create_required_nodes(particles1: ParticlesSystemGpuSopNode) {
	// create output and globals
	const output1 = particles1.createNode('output');
	const globals1 = particles1.createNode('globals');
	// create material
	const MAT = window.MAT;
	const mat_node = MAT.createNode('pointsBuilder');
	mat_node.createNode('output');
	particles1.p.material.set(mat_node.fullPath());

	return {output1, globals1};
}

QUnit.test('ParticlesSystemGPU simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	await scene.wait_for_cooks_completed();
	const {renderer} = await RendererUtils.wait_for_renderer();
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0);
	const {output1, globals1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2);

	const add1 = particles1.createNode('add');
	add1.setInput(0, globals1, 'position');
	output1.setInput('position', add1);
	add1.params.get('add1')!.set([0, 1, 0]);

	plane1.p.size.set([2, 2]);
	plane1.p.useSegmentsCount.set(1);
	delete1.set_class(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	particles1.setInput(0, delete1);

	scene.setFrame(1);
	await particles1.requestContainer();
	const render_material = particles1.render_controller.render_material()!;
	const uniform = render_material.uniforms.texture_particles_0;

	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 1, -1, 0].join(':'), 'point moved up');

	scene.setFrame(2);
	let render_target2 = particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 2, -1, 0].join(':'), 'point moved up');

	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 3, -1, 0].join(':'), 'point moved up');

	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 4, -1, 0].join(':'), 'point moved up');

	RendererUtils.dispose();
});

QUnit.test('ParticlesSystemGPU with param and persisted_config', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	await scene.wait_for_cooks_completed();
	const {renderer} = await RendererUtils.wait_for_renderer();
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0);
	const {output1, globals1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2);
	const add1 = particles1.createNode('add');
	const param1 = particles1.createNode('param');
	param1.set_gl_type(GlConnectionPointType.VEC3);
	param1.p.name.set('test_param');
	add1.setInput(0, globals1, 'position');
	add1.setInput(1, param1);
	output1.setInput('position', add1);

	plane1.p.size.set([2, 2]);
	plane1.p.useSegmentsCount.set(1);
	delete1.set_class(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	particles1.setInput(0, delete1);

	scene.setFrame(1);
	await particles1.requestContainer();
	const test_param = particles1.params.get('test_param')!;
	assert.ok(test_param, 'test_param is created');
	test_param.set([0, 1, 0]);
	particles1.p.reset.press_button();
	await particles1.requestContainer();

	const render_material = particles1.render_controller.render_material()!;
	const uniform = render_material.uniforms.texture_particles_0;
	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');
	const all_variables = particles1.gpu_controller.all_variables();
	assert.equal(all_variables.length, 1);
	const variable = all_variables[0];
	const param_uniform = variable.material.uniforms.v_POLY_param1_val;
	assert.deepEqual(param_uniform.value.toArray(), [0, 1, 0], 'param uniform set to the expected value');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 1, -1, 0].join(':'), 'point moved up');

	scene.setFrame(2);
	let render_target2 = particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 2, -1, 0].join(':'), 'point moved up');

	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 3, -1, 0].join(':'), 'point moved up');

	test_param.set([0, 0.5, 0]);
	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 3.5, -1, 0].join(':'), 'point moved up');

	test_param.set([0, 2, 0]);
	scene.setFrame(5);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 5.5, -1, 0].join(':'), 'point moved up');

	test_param.set([1, 0, 0]);
	scene.setFrame(6);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0, 5.5, -1, 0].join(':'), 'point moved up');

	scene.setFrame(1);
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.with_unregistered_assembler(particles1.used_assembler(), async () => {
		console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.load_data(data);
		await scene2.wait_for_cooks_completed();

		const new_particles1 = scene2.node('/geo1/particlesSystemGpu1') as ParticlesSystemGpuSopNode;
		assert.notOk(new_particles1.assembler_controller);
		assert.ok(new_particles1.persisted_config);
		const test_param2 = new_particles1.params.get('test_param') as Vector3Param;
		assert.ok(test_param2);

		assert.deepEqual(test_param2.value.toArray(), [1, 0, 0], 'test param is read back with expected value');
		assert.equal(scene2.frame, 1);
		new_particles1.p.reset.press_button();
		await new_particles1.requestContainer();

		render_target1 = new_particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[0, 0, -1, 0].join(':'),
			'point with persisted config moved x'
		);

		scene2.setFrame(2);
		render_target2 = new_particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
		renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[1, 0, -1, 0].join(':'),
			'point with persisted config moved x'
		);

		test_param2.set([0, 2, 0]);
		scene2.setFrame(3);
		render_target1 = new_particles1.gpu_controller.getCurrentRenderTarget(ShaderName.PARTICLES_0)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[1, 2, -1, 0].join(':'),
			'point with persisted config moved y'
		);
	});

	RendererUtils.dispose();
});

QUnit.skip(
	'ParticlesSystemGPU spare params are created from param, ramp and texture nodes even when not connected to output',
	async (assert) => {
		assert.equal(1, 2);
	}
);
