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

import ADD from './particlesSystemGPU/add.glsl';
import RESTP from './particlesSystemGPU/restP.glsl';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {MaterialsNetworkSopNode} from '../../../../src/engine/nodes/sop/MaterialsNetwork';
import {PointsBuilderMatNode} from '../../../../src/engine/nodes/mat/PointsBuilder';
import {ParamType} from '../../../../src/engine/poly/ParamType';
const TEMPLATES = {
	ADD,
	RESTP,
};

function create_required_nodes(particles1: ParticlesSystemGpuSopNode) {
	// create output and globals
	const output1 = particles1.createNode('output');
	const globals1 = particles1.createNode('globals');
	// create material
	const MAT = window.MAT;
	const mat_node = MAT.createNode('pointsBuilder');
	mat_node.createNode('output');
	particles1.p.material.set(mat_node.path());

	return {output1, globals1};
}

QUnit.test('ParticlesSystemGPU simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0, 'no children on start');
	const {output1, globals1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2, 'has 2 children');

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
	await particles1.compute();
	const render_material = particles1.renderController.material()!;
	const uniform = render_material.uniforms.texture_position;

	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 2, -1, 0].join(':'), 'point moved up');

	scene.setFrame(2);
	let render_target2 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 3, -1, 0].join(':'), 'point moved up');

	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 4, -1, 0].join(':'), 'point moved up');

	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 5, -1, 0].join(':'), 'point moved up');

	RendererUtils.dispose();
});

QUnit.test('ParticlesSystemGPU with param and persisted_config', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0);
	const {output1, globals1} = create_required_nodes(particles1);
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
	delete1.set_class(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	particles1.setInput(0, delete1);

	scene.setFrame(1);
	await particles1.compute();
	const test_param = particles1.params.get('test_param')!;
	assert.ok(test_param, 'test_param is created');
	test_param.set([0, 1, 0]);
	particles1.p.reset.pressButton();
	await particles1.compute();

	const render_material = particles1.renderController.material()!;
	const uniform = render_material.uniforms.texture_position;
	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');
	const all_variables = particles1.gpuController.allVariables();
	assert.equal(all_variables.length, 1);
	const variable = all_variables[0];
	const param_uniform = variable.material.uniforms.v_POLY_param_test_param;
	assert.deepEqual(param_uniform.value.toArray(), [0, 1, 0], 'param uniform set to the expected value');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 2, -1, 0].join(':'), 'point moved up');

	scene.setFrame(2);
	let render_target2 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 3, -1, 0].join(':'), 'point moved up');

	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 4, -1, 0].join(':'), 'point moved up');

	test_param.set([0, 0.5, 0]);
	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 4.5, -1, 0].join(':'), 'point moved up');

	test_param.set([0, 2, 0]);
	scene.setFrame(5);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-1, 6.5, -1, 0].join(':'), 'point moved up');

	test_param.set([1, 0, 0]);
	scene.setFrame(6);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [0, 6.5, -1, 0].join(':'), 'point moved up');

	scene.setFrame(1);
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(particles1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_particles1 = scene2.node('/geo1/particlesSystemGpu1') as ParticlesSystemGpuSopNode;
		assert.notOk(new_particles1.assemblerController);
		assert.ok(new_particles1.persisted_config);
		const test_param2 = new_particles1.params.get('test_param') as Vector3Param;
		assert.ok(test_param2);

		assert.deepEqual(test_param2.value.toArray(), [1, 0, 0], 'test param is read back with expected value');
		assert.equal(scene2.frame(), 1);
		new_particles1.p.reset.pressButton();
		await new_particles1.compute();

		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[1, 0, -1, 0].join(':'),
			'point with persisted config moved x'
		);

		scene2.setFrame(2);
		render_target2 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[2, 0, -1, 0].join(':'),
			'point with persisted config moved x'
		);

		test_param2.set([0, 2, 0]);
		scene2.setFrame(3);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[2, 2, -1, 0].join(':'),
			'point with persisted config moved y'
		);

		test_param2.set([-2, -4, -8]);
		scene2.setFrame(4);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[0, -2, -9, 0].join(':'),
			'point with persisted config moved in all axises'
		);
	});

	RendererUtils.dispose();
});

QUnit.test('ParticlesSystemGPU attributes are used without needing to be set as exporting', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const delete1 = geo1.createNode('delete');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0, 'no children');
	const {output1, globals1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2, '2 children');

	plane1.p.size.set([2, 2]);
	plane1.p.useSegmentsCount.set(1);
	delete1.set_class(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	particles1.setInput(0, delete1);

	// first we test when nothing is plugged into the output node
	await particles1.compute();

	let gpuMaterial = particles1.gpuController.materials()[0];
	assert.notOk(gpuMaterial, 'no material created yet');
	let all_variables = particles1.gpuController.allVariables();
	assert.equal(all_variables.length, 0, 'no variables');

	// then we use an add node
	const add1 = particles1.createNode('add');
	const param1 = particles1.createNode('param');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('test_param');
	add1.setInput(0, globals1, 'position');
	add1.setInput(1, param1);
	output1.setInput('position', add1);

	await particles1.compute();
	let test_param = particles1.params.get('test_param')!;
	assert.ok(test_param, 'test_param is created');
	test_param.set([0, 1, 0]);

	gpuMaterial = particles1.gpuController.materials()[0];
	assert.ok(gpuMaterial);
	assert.deepEqual(
		Object.keys(gpuMaterial.uniforms).sort(),
		['delta_time', 'texture_position', 'time', 'v_POLY_param_test_param'],
		'uniforms ok'
	);
	assert.ok(gpuMaterial, 'material ok');
	assert.equal(gpuMaterial.fragmentShader, TEMPLATES.ADD, 'add frag ok');
	all_variables = particles1.gpuController.allVariables();
	assert.equal(all_variables.length, 1, '1 variable');
	let gpuTexturesByName = particles1.gpuController.createdTexturesByName();
	assert.ok(gpuTexturesByName.get('position' as ShaderName), 'texture position has been created');
	assert.equal(gpuTexturesByName.size, 1, '1 texture');

	// now add a restP attribute
	const restAttributes = geo1.createNode('restAttributes');
	restAttributes.p.tposition.set(true);
	restAttributes.p.tnormal.set(false);
	restAttributes.setInput(0, delete1);
	particles1.setInput(0, restAttributes);

	const restPAttribute = particles1.createNode('attribute');
	restPAttribute.p.name.set('restP');
	restPAttribute.setAttribSize(3);
	add1.setInput(2, restPAttribute);

	await particles1.compute();
	test_param = particles1.params.get('test_param')!;
	assert.ok(test_param, 'test_param is created');
	test_param.set([0, 1, 0]);

	gpuMaterial = particles1.gpuController.materials()[0];
	assert.ok(gpuMaterial);
	assert.deepEqual(
		Object.keys(gpuMaterial.uniforms).sort(),
		['delta_time', 'texture_position', 'texture_restP', 'time', 'v_POLY_param_test_param'],
		'uniforms ok'
	);
	assert.ok(gpuMaterial, 'material ok');
	assert.equal(gpuMaterial.fragmentShader, TEMPLATES.RESTP, 'add frag ok');
	all_variables = particles1.gpuController.allVariables();
	assert.equal(all_variables.length, 1, '1 variable');
	gpuTexturesByName = particles1.gpuController.createdTexturesByName();
	assert.ok(gpuTexturesByName.get('position' as ShaderName), 'texture position has been created');
	assert.ok(gpuTexturesByName.get('restP' as ShaderName), 'texture restP has been created');
	assert.equal(gpuTexturesByName.size, 2, '2 textures');

	const renderMaterial = particles1.renderController.material()!;
	assert.ok(renderMaterial, 'material ok');
	const uniform = renderMaterial.uniforms.texture_position;
	assert.ok(uniform, 'uniform ok');
	all_variables = particles1.gpuController.allVariables();
	assert.equal(all_variables.length, 1);
	const variable = all_variables[0];
	const param_uniform = variable.material.uniforms.v_POLY_param_test_param;
	assert.deepEqual(param_uniform.value.toArray(), [0, 1, 0], 'param uniform set to the expected value');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-2, 1, -2, 0].join(':'), 'point moved');

	scene.setFrame(1);
	let render_target2 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-3, 2, -3, 0].join(':'), 'point moved');

	scene.setFrame(2);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-4, 3, -4, 0].join(':'), 'point moved up');

	test_param.set([0, 0.5, 0]);
	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-5, 3.5, -5, 0].join(':'), 'point moved up');

	test_param.set([0, 2, 0]);
	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-6, 5.5, -6, 0].join(':'), 'point moved up');

	test_param.set([1, 0, 0]);
	scene.setFrame(5);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [-6, 5.5, -7, 0].join(':'), 'point moved up');

	scene.setFrame(0);
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(particles1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_particles1 = scene2.node('/geo1/particlesSystemGpu1') as ParticlesSystemGpuSopNode;
		assert.notOk(new_particles1.assemblerController);
		assert.ok(new_particles1.persisted_config);
		const test_param2 = new_particles1.params.get('test_param') as Vector3Param;
		assert.ok(test_param2);

		assert.deepEqual(test_param2.value.toArray(), [1, 0, 0], 'test param is read back with expected value');
		assert.equal(scene2.frame(), 0);
		new_particles1.p.reset.pressButton();
		await new_particles1.compute();

		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[-1, 0, -2, 0].join(':'),
			'point with persisted config moved x'
		);

		scene2.setFrame(2);
		render_target2 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[-1, 0, -4, 0].join(':'),
			'point with persisted config moved x'
		);

		test_param2.set([0, 2, 0]);
		scene2.setFrame(3);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[-2, 2, -5, 0].join(':'),
			'point with persisted config moved y'
		);

		// and if we set the active param to 0, nothing moves
		scene2.setFrame(4);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(AssertUtils.array_with_precision(pixelBuffer), [-3, 4, -6, 0].join(':'), 'active still on');
		new_particles1.p.active.set(0);
		scene2.setFrame(5);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(AssertUtils.array_with_precision(pixelBuffer), [-3, 4, -6, 0].join(':'), 'active now off');
		scene2.setFrame(6);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(AssertUtils.array_with_precision(pixelBuffer), [-3, 4, -6, 0].join(':'), 'active still off');
		// and if we set the active param back to 1, particles move again
		new_particles1.p.active.set(1);
		scene2.setFrame(7);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[-4, 6, -7, 0].join(':'),
			'point with persisted config moved y'
		);
		scene2.setFrame(8);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.array_with_precision(pixelBuffer),
			[-5, 8, -8, 0].join(':'),
			'point with persisted config moved y'
		);
	});

	RendererUtils.dispose();
});

QUnit.test('ParticlesSystemGPU node can be deleted without error', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const plane1 = geo1.createNode('plane');
	const scatter1 = geo1.createNode('scatter');
	const particles1 = geo1.createNode('particlesSystemGpu');

	scatter1.setInput(0, plane1);
	particles1.setInput(0, scatter1);

	await particles1.compute();
	geo1.removeNode(particles1);

	assert.equal(1, 1);

	RendererUtils.dispose();
});

QUnit.test('texture allocation works as expected wih pos, vel, normal and bby float', async (assert) => {
	const geo1 = window.geo1;
	const parentNode = geo1;
	function create_particlesSystemGpu1(parentNode: GeoObjNode) {
		var particlesSystemGpu1 = parentNode.createNode('particlesSystemGpu');
		particlesSystemGpu1.setName('particlesSystemGpu1');
		function create_acceleration1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var acceleration1 = particlesSystemGpu1.createNode('acceleration');
			acceleration1.setName('acceleration1');
			acceleration1.uiData.setPosition(0, 50);
			acceleration1.addParam(ParamType.VECTOR3, 'position', [0, 0, 0], {spare: true});
			acceleration1.addParam(ParamType.VECTOR3, 'velocity', [0, 0, 0], {spare: true});
			acceleration1.addParam(ParamType.FLOAT, 'mass', 1, {spare: true});
			acceleration1.addParam(ParamType.VECTOR3, 'force', [0, -9.8, 0], {spare: true});
			acceleration1.params.postCreateSpareParams();
			acceleration1.params.runOnSceneLoadHooks();
			return acceleration1;
		}
		function create_add1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var add1 = particlesSystemGpu1.createNode('add');
			add1.setName('add1');
			add1.uiData.setPosition(-200, 100);
			add1.addParam(ParamType.VECTOR3, 'add0', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add1', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add2', [0, 0, 0], {spare: true});
			add1.params.postCreateSpareParams();
			add1.params.runOnSceneLoadHooks();
			return add1;
		}
		function create_attribute1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute1 = particlesSystemGpu1.createNode('attribute');
			attribute1.setName('attribute1');
			attribute1.uiData.setPosition(-500, 100);
			attribute1.params.get('name')!.set('normal');
			attribute1.params.get('type')!.set(2);
			attribute1.params.get('texportWhenConnected')!.set(true);
			attribute1.addParam(ParamType.VECTOR3, 'in', [0, 0, 0], {spare: true});
			attribute1.params.postCreateSpareParams();
			attribute1.params.runOnSceneLoadHooks();
			return attribute1;
		}
		function create_attribute2(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute2 = particlesSystemGpu1.createNode('attribute');
			attribute2.setName('attribute2');
			attribute2.uiData.setPosition(-500, 250);
			attribute2.params.get('name')!.set('bby');
			attribute2.params.get('texportWhenConnected')!.set(true);
			attribute2.addParam(ParamType.FLOAT, 'in', 0, {spare: true});
			attribute2.params.postCreateSpareParams();
			attribute2.params.runOnSceneLoadHooks();
			return attribute2;
		}
		function create_floatToVec3_1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var floatToVec3_1 = particlesSystemGpu1.createNode('floatToVec3');
			floatToVec3_1.setName('floatToVec3_1');
			floatToVec3_1.uiData.setPosition(-350, 200);
			floatToVec3_1.params.postCreateSpareParams();
			floatToVec3_1.params.runOnSceneLoadHooks();
			return floatToVec3_1;
		}
		function create_globals1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var globals1 = particlesSystemGpu1.createNode('globals');
			globals1.setName('globals1');
			globals1.uiData.setPosition(-250, -50);
			globals1.params.postCreateSpareParams();
			globals1.params.runOnSceneLoadHooks();
			return globals1;
		}
		function create_output1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var output1 = particlesSystemGpu1.createNode('output');
			output1.setName('output1');
			output1.uiData.setPosition(200, 0);
			output1.params.postCreateSpareParams();
			output1.params.runOnSceneLoadHooks();
			return output1;
		}
		var acceleration1 = create_acceleration1(particlesSystemGpu1);
		var add1 = create_add1(particlesSystemGpu1);
		var attribute1 = create_attribute1(particlesSystemGpu1);
		var attribute2 = create_attribute2(particlesSystemGpu1);
		var floatToVec3_1 = create_floatToVec3_1(particlesSystemGpu1);
		var globals1 = create_globals1(particlesSystemGpu1);
		var output1 = create_output1(particlesSystemGpu1);
		acceleration1.setInput('position', globals1, 'position');
		acceleration1.setInput('velocity', globals1, 'velocity');
		acceleration1.setInput('force', add1, 'sum');
		add1.setInput('add0', attribute1, 'val');
		add1.setInput('add1', floatToVec3_1, 'vec3');
		floatToVec3_1.setInput('y', attribute2, 'val');
		output1.setInput('position', acceleration1, 'position');
		output1.setInput('velocity', acceleration1, 'velocity');
		particlesSystemGpu1.uiData.setPosition(-150, 50);
		particlesSystemGpu1.params.get('material')!.set('../MAT/pointsParticles');
		particlesSystemGpu1.params.postCreateSpareParams();
		particlesSystemGpu1.params.runOnSceneLoadHooks();
		return {particlesSystemGpu1};
	}
	function create_MAT(parentNode: GeoObjNode) {
		var MAT = parentNode.createNode('materialsNetwork');
		MAT.setName('MAT');
		function create_pointsParticles(MAT: MaterialsNetworkSopNode) {
			var pointsParticles = MAT.createNode('pointsBuilder');
			pointsParticles.setName('pointsParticles');
			function create_constant_point_size(pointsParticles: PointsBuilderMatNode) {
				var constant_point_size = pointsParticles.createNode('constant');
				constant_point_size.setName('constant_point_size');
				constant_point_size.uiData.setPosition(0, 0);
				constant_point_size.params.get('float')!.set(4);
				constant_point_size.params.postCreateSpareParams();
				constant_point_size.params.runOnSceneLoadHooks();
				return constant_point_size;
			}

			function create_output1(pointsParticles: PointsBuilderMatNode) {
				var output1 = pointsParticles.createNode('output');
				output1.setName('output1');
				output1.uiData.setPosition(200, 0);
				output1.params.postCreateSpareParams();
				output1.params.runOnSceneLoadHooks();
				return output1;
			}
			var constant_point_size = create_constant_point_size(pointsParticles);
			var output1 = create_output1(pointsParticles);
			output1.setInput('gl_PointSize', constant_point_size, 'val');
			pointsParticles.uiData.setPosition(0, 0);
			pointsParticles.params.postCreateSpareParams();
			pointsParticles.params.runOnSceneLoadHooks();
			return pointsParticles;
		}
		create_pointsParticles(MAT);
		MAT.uiData.setPosition(-350, 50);
		MAT.params.postCreateSpareParams();
		MAT.params.runOnSceneLoadHooks();
		return MAT;
	}
	function create_attribCreate1(parentNode: GeoObjNode) {
		var attribCreate1 = parentNode.createNode('attribCreate');
		attribCreate1.setName('attribCreate1');
		attribCreate1.uiData.setPosition(-150, -50);
		attribCreate1.params.get('name')!.set('bby');
		attribCreate1.params.get('value1')!.set("(@P.y - bbox(0, 'min').y) / bbox(0,'size').y");
		attribCreate1.params.postCreateSpareParams();
		attribCreate1.params.runOnSceneLoadHooks();
		return attribCreate1;
	}
	function create_sphere1(parentNode: GeoObjNode) {
		var sphere1 = parentNode.createNode('sphere');
		sphere1.setName('sphere1');
		sphere1.uiData.setPosition(-150, -250);
		sphere1.params.postCreateSpareParams();
		sphere1.params.runOnSceneLoadHooks();
		return sphere1;
	}
	function create_scatter1(parentNode: GeoObjNode) {
		var scatter1 = parentNode.createNode('scatter');
		scatter1.setName('scatter1');
		scatter1.uiData.setPosition(-150, -150);
		scatter1.params.postCreateSpareParams();
		scatter1.params.runOnSceneLoadHooks();
		return scatter1;
	}
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer);
	const box = geo1.createNode('box');
	box.flags.display.set(true);
	const {particlesSystemGpu1} = create_particlesSystemGpu1(parentNode);
	create_MAT(parentNode);
	var attribCreate1 = create_attribCreate1(parentNode);
	var sphere1 = create_sphere1(parentNode);
	var scatter1 = create_scatter1(parentNode);
	scatter1.setInput(0, sphere1);
	attribCreate1.setInput(0, scatter1);
	particlesSystemGpu1.setInput(0, attribCreate1);
	// await attribCreate1.compute();
	await particlesSystemGpu1.compute();
	const allocationJSON = particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations;
	assert.ok(allocationJSON);
	assert.deepEqual(allocationJSON, {
		writable: [
			{
				velocity: [
					{
						name: 'velocity',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/output1'],
					},
				],
			},
			{
				position: [
					{
						name: 'position',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/output1', '/geo1/particlesSystemGpu1/globals1'],
					},
				],
			},
		],
		readonly: [
			{
				normal_SEPARATOR_bby: [
					{
						name: 'normal',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/attribute1'],
					},
					{
						name: 'bby',
						size: 1,
						nodes: ['/geo1/particlesSystemGpu1/attribute2'],
					},
				],
			},
		],
	});
});

QUnit.test('material can use a float attribute also used in simulation in readonly', async (assert) => {
	const geo1 = window.geo1;
	const parentNode = geo1;
	function create_particlesSystemGpu1(parentNode: GeoObjNode) {
		var particlesSystemGpu1 = parentNode.createNode('particlesSystemGpu');
		particlesSystemGpu1.setName('particlesSystemGpu1');
		function create_add1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var add1 = particlesSystemGpu1.createNode('add');
			add1.setName('add1');
			add1.uiData.setPosition(0, -50);
			add1.addParam(ParamType.VECTOR3, 'add0', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add1', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add2', [0, 0, 0], {spare: true});
			add1.addParam(ParamType.VECTOR3, 'add3', [0, 0, 0], {spare: true});
			add1.params.postCreateSpareParams();
			add1.params.runOnSceneLoadHooks();
			return add1;
		}
		function create_attribute_randomId_read(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute1 = particlesSystemGpu1.createNode('attribute');
			attribute1.setName('attribute1');
			attribute1.uiData.setPosition(-300, 200);
			attribute1.params.get('name')!.set('randomId');
			attribute1.params.get('texportWhenConnected')!.set(true);
			attribute1.addParam(ParamType.FLOAT, 'in', 0, {spare: true});
			attribute1.params.postCreateSpareParams();
			attribute1.params.runOnSceneLoadHooks();
			return attribute1;
		}
		function create_attribute2(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute2 = particlesSystemGpu1.createNode('attribute');
			attribute2.setName('attribute2');
			attribute2.uiData.setPosition(-300, 0);
			attribute2.params.get('name')!.set('normal');
			attribute2.params.get('type')!.set(2);
			attribute2.params.get('texportWhenConnected')!.set(true);
			attribute2.addParam(ParamType.VECTOR3, 'in', [0, 0, 0], {spare: true});
			attribute2.params.postCreateSpareParams();
			attribute2.params.runOnSceneLoadHooks();
			return attribute2;
		}
		function create_attribute_randomId_export(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var attribute3 = particlesSystemGpu1.createNode('attribute');
			attribute3.setName('attribute3');
			attribute3.uiData.setPosition(200, 200);
			attribute3.params.get('name')!.set('randomId');
			attribute3.params.get('texportWhenConnected')!.set(true);
			attribute3.params.get('exportWhenConnected')!.set(true);
			attribute3.addParam(ParamType.FLOAT, 'in', 0, {spare: true});
			attribute3.params.postCreateSpareParams();
			attribute3.params.runOnSceneLoadHooks();
			return attribute3;
		}
		function create_floatToVec3_1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var floatToVec3_1 = particlesSystemGpu1.createNode('floatToVec3');
			floatToVec3_1.setName('floatToVec3_1');
			floatToVec3_1.uiData.setPosition(-100, 150);
			floatToVec3_1.params.postCreateSpareParams();
			floatToVec3_1.params.runOnSceneLoadHooks();
			return floatToVec3_1;
		}
		function create_globals1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var globals1 = particlesSystemGpu1.createNode('globals');
			globals1.setName('globals1');
			globals1.uiData.setPosition(-250, -150);
			globals1.params.postCreateSpareParams();
			globals1.params.runOnSceneLoadHooks();
			return globals1;
		}
		function create_output1(particlesSystemGpu1: ParticlesSystemGpuSopNode) {
			var output1 = particlesSystemGpu1.createNode('output');
			output1.setName('output1');
			output1.uiData.setPosition(200, 0);
			output1.params.postCreateSpareParams();
			output1.params.runOnSceneLoadHooks();
			return output1;
		}
		var add1 = create_add1(particlesSystemGpu1);
		var attribute_randomId_read = create_attribute_randomId_read(particlesSystemGpu1);
		var attribute2 = create_attribute2(particlesSystemGpu1);
		var attribute_randomId_export = create_attribute_randomId_export(particlesSystemGpu1);
		var floatToVec3_1 = create_floatToVec3_1(particlesSystemGpu1);
		var globals1 = create_globals1(particlesSystemGpu1);
		var output1 = create_output1(particlesSystemGpu1);
		add1.setInput('add0', globals1, 'position');
		add1.setInput('add1', attribute2, 'val');
		add1.setInput('add2', floatToVec3_1, 'vec3');
		attribute_randomId_export.setInput('in', attribute_randomId_read, 'val');
		floatToVec3_1.setInput('y', attribute_randomId_read, 'val');
		output1.setInput('position', add1, 'sum');
		particlesSystemGpu1.childrenController!.selection.add([attribute_randomId_export]);
		particlesSystemGpu1.uiData.setPosition(-150, 50);
		particlesSystemGpu1.params.get('material')!.set('../MAT/pointsParticles');
		particlesSystemGpu1.params.postCreateSpareParams();
		particlesSystemGpu1.params.runOnSceneLoadHooks();
		return {particlesSystemGpu1, attribute_randomId_read, attribute_randomId_export};
	}
	function create_MAT(parentNode: GeoObjNode) {
		var MAT = parentNode.createNode('materialsNetwork');
		MAT.setName('MAT');
		function create_pointsParticles(MAT: MaterialsNetworkSopNode) {
			var pointsParticles = MAT.createNode('pointsBuilder');
			pointsParticles.setName('pointsParticles');
			function create_attribute1(pointsParticles: PointsBuilderMatNode) {
				var attribute1 = pointsParticles.createNode('attribute');
				attribute1.setName('attribute1');
				attribute1.uiData.setPosition(-300, -150);
				attribute1.params.get('name')!.set('randomId');
				attribute1.params.postCreateSpareParams();
				attribute1.params.runOnSceneLoadHooks();
				return attribute1;
			}
			function create_constant_point_size(pointsParticles: PointsBuilderMatNode) {
				var constant_point_size = pointsParticles.createNode('constant');
				constant_point_size.setName('constant_point_size');
				constant_point_size.uiData.setPosition(0, 150);
				constant_point_size.params.get('float')!.set(4);
				constant_point_size.params.postCreateSpareParams();
				constant_point_size.params.runOnSceneLoadHooks();
				return constant_point_size;
			}
			function create_floatToVec3_1(pointsParticles: PointsBuilderMatNode) {
				var floatToVec3_1 = pointsParticles.createNode('floatToVec3');
				floatToVec3_1.setName('floatToVec3_1');
				floatToVec3_1.uiData.setPosition(-150, -150);
				floatToVec3_1.params.get('y')!.set(1);
				floatToVec3_1.params.get('z')!.set(0.91);
				floatToVec3_1.params.postCreateSpareParams();
				floatToVec3_1.params.runOnSceneLoadHooks();
				return floatToVec3_1;
			}
			function create_hsvToRgb1(pointsParticles: PointsBuilderMatNode) {
				var hsvToRgb1 = pointsParticles.createNode('hsvToRgb');
				hsvToRgb1.setName('hsvToRgb1');
				hsvToRgb1.uiData.setPosition(-50, -150);
				hsvToRgb1.params.postCreateSpareParams();
				hsvToRgb1.params.runOnSceneLoadHooks();
				return hsvToRgb1;
			}
			function create_output1(pointsParticles: PointsBuilderMatNode) {
				var output1 = pointsParticles.createNode('output');
				output1.setName('output1');
				output1.uiData.setPosition(200, 0);
				output1.params.postCreateSpareParams();
				output1.params.runOnSceneLoadHooks();
				return output1;
			}
			var attribute1 = create_attribute1(pointsParticles);
			var constant_point_size = create_constant_point_size(pointsParticles);
			var floatToVec3_1 = create_floatToVec3_1(pointsParticles);
			var hsvToRgb1 = create_hsvToRgb1(pointsParticles);
			var output1 = create_output1(pointsParticles);
			floatToVec3_1.setInput('x', attribute1, 'val');
			hsvToRgb1.setInput('hsv', floatToVec3_1, 'vec3');
			output1.setInput('color', hsvToRgb1, 'rgb');
			output1.setInput('gl_PointSize', constant_point_size, 'val');
			pointsParticles.uiData.setPosition(0, 0);
			pointsParticles.params.postCreateSpareParams();
			pointsParticles.params.runOnSceneLoadHooks();
			return pointsParticles;
		}
		const pointsBuilder1 = create_pointsParticles(MAT);
		MAT.uiData.setPosition(-350, 50);
		MAT.params.postCreateSpareParams();
		MAT.params.runOnSceneLoadHooks();
		return {MAT, pointsBuilder1};
	}
	function create_attribCreate1(parentNode: GeoObjNode) {
		var attribCreate1 = parentNode.createNode('attribCreate');
		attribCreate1.setName('attribCreate1');
		attribCreate1.uiData.setPosition(-150, -150);
		attribCreate1.params.get('name')!.set('randomId');
		attribCreate1.params.get('value1')!.set('rand(@ptnum * 124.543)');
		attribCreate1.params.postCreateSpareParams();
		attribCreate1.params.runOnSceneLoadHooks();
		return attribCreate1;
	}
	function create_sphere1(parentNode: GeoObjNode) {
		var sphere1 = parentNode.createNode('sphere');
		sphere1.setName('sphere1');
		sphere1.uiData.setPosition(-150, -350);
		sphere1.params.postCreateSpareParams();
		sphere1.params.runOnSceneLoadHooks();
		return sphere1;
	}
	function create_scatter1(parentNode: GeoObjNode) {
		var scatter1 = parentNode.createNode('scatter');
		scatter1.setName('scatter1');
		scatter1.uiData.setPosition(-150, -250);
		scatter1.params.postCreateSpareParams();
		scatter1.params.runOnSceneLoadHooks();
		return scatter1;
	}
	const box = geo1.createNode('box');
	box.flags.display.set(true);
	const {particlesSystemGpu1, attribute_randomId_read, attribute_randomId_export} =
		create_particlesSystemGpu1(parentNode);
	const {pointsBuilder1} = create_MAT(parentNode);
	const attribCreate1 = create_attribCreate1(parentNode);
	const sphere1 = create_sphere1(parentNode);
	const scatter1 = create_scatter1(parentNode);
	particlesSystemGpu1.setInput(0, attribCreate1);
	attribCreate1.setInput(0, scatter1);
	scatter1.setInput(0, sphere1);

	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer);

	await particlesSystemGpu1.compute();
	const material = pointsBuilder1.material;

	// with attrib exported from particles
	assert.includes(
		material.vertexShader,
		'vec3 transformed = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).xyz;'
	);
	assert.includes(
		material.fragmentShader,
		'float v_POLY_attribute1_val = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).w;'
	);
	assert.deepEqual(particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations, {
		writable: [
			{
				position_SEPARATOR_randomId: [
					{
						name: 'position',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/output1', '/geo1/particlesSystemGpu1/globals1'],
					},
					{
						name: 'randomId',
						size: 1,
						nodes: ['/geo1/particlesSystemGpu1/attribute3', '/geo1/particlesSystemGpu1/attribute1'],
					},
				],
			},
		],
		readonly: [{normal: [{name: 'normal', size: 3, nodes: ['/geo1/particlesSystemGpu1/attribute2']}]}],
	});

	// with attrib exported from particles
	attribute_randomId_export.setInput(0, null);
	await particlesSystemGpu1.compute();
	assert.includes(
		material.vertexShader,
		'vec3 transformed = texture2D( texture_position, particles_sim_uv_varying ).xyz;'
	);
	assert.not_includes(
		material.fragmentShader,
		'float v_POLY_attribute1_val = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).w;'
	);
	assert.includes(material.fragmentShader, `float v_POLY_attribute1_val = v_POLY_attribute_randomId;`);
	assert.deepEqual(particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations, {
		writable: [
			{
				position: [
					{
						name: 'position',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/output1', '/geo1/particlesSystemGpu1/globals1'],
					},
				],
			},
		],
		readonly: [
			{
				normal_SEPARATOR_randomId: [
					{name: 'normal', size: 3, nodes: ['/geo1/particlesSystemGpu1/attribute2']},
					{name: 'randomId', size: 1, nodes: ['/geo1/particlesSystemGpu1/attribute1']},
				],
			},
		],
	});

	// re setInput
	attribute_randomId_export.setInput(0, attribute_randomId_read);
	await particlesSystemGpu1.compute();
	assert.deepEqual(particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations, {
		writable: [
			{
				position_SEPARATOR_randomId: [
					{
						name: 'position',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/output1', '/geo1/particlesSystemGpu1/globals1'],
					},
					{
						name: 'randomId',
						size: 1,
						nodes: ['/geo1/particlesSystemGpu1/attribute3', '/geo1/particlesSystemGpu1/attribute1'],
					},
				],
			},
		],
		readonly: [{normal: [{name: 'normal', size: 3, nodes: ['/geo1/particlesSystemGpu1/attribute2']}]}],
	});
	assert.includes(
		material.vertexShader,
		`vec3 transformed = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).xyz;`
	);
	assert.includes(
		material.fragmentShader,
		`float v_POLY_attribute1_val = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).w;`
	);

	// change name
	attribute_randomId_export.p.name.set('otherAttrib');
	await particlesSystemGpu1.compute();
	assert.deepEqual(particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations, {
		writable: [
			{
				position_SEPARATOR_otherAttrib: [
					{
						name: 'position',
						size: 3,
						nodes: ['/geo1/particlesSystemGpu1/output1', '/geo1/particlesSystemGpu1/globals1'],
					},
					{name: 'otherAttrib', size: 1, nodes: ['/geo1/particlesSystemGpu1/attribute3']},
				],
			},
		],
		readonly: [
			{
				normal_SEPARATOR_randomId: [
					{name: 'normal', size: 3, nodes: ['/geo1/particlesSystemGpu1/attribute2']},
					{name: 'randomId', size: 1, nodes: ['/geo1/particlesSystemGpu1/attribute1']},
				],
			},
		],
	});
	assert.includes(
		material.vertexShader,
		`vec3 transformed = texture2D( texture_position_SEPARATOR_otherAttrib, particles_sim_uv_varying ).xyz;`
	);
	assert.includes(material.fragmentShader, `float v_POLY_attribute1_val = v_POLY_attribute_randomId;`);
});

QUnit.test('ParticlesSystemGPU attributes can be used from inside a subnet', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const sopadd1 = geo1.createNode('add');
	const restAttributes1 = geo1.createNode('restAttributes');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0, 'no children');
	const {output1, globals1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2, '2 children');

	sopadd1.p.createPoint.set(1);
	sopadd1.p.position.set([1, 0.5, 0.25]);
	restAttributes1.setInput(0, sopadd1);
	particles1.setInput(0, restAttributes1);

	// we set up an attribute inside a subnet
	const subnet1 = particles1.createNode('subnet');
	subnet1.p.inputsCount.set(1);
	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	const subnet1_subnetInput1 = subnet1.createNode('subnetInput');
	const subnet1_subnetOutput1 = subnet1.createNode('subnetOutput');
	const attribute1 = subnet1.createNode('attribute');
	const add1 = subnet1.createNode('add');
	attribute1.setGlType(GlConnectionPointType.VEC3);
	attribute1.p.name.set('restP');
	add1.setInput(0, attribute1);
	add1.setInput(1, subnet1_subnetInput1);
	subnet1_subnetOutput1.setInput(0, add1);
	subnet1.setInput(0, globals1, 'position');
	output1.setInput('position', subnet1);

	scene.setFrame(1);
	await particles1.compute();
	const render_material = particles1.renderController.material()!;
	const uniform = render_material.uniforms.texture_position;

	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [3, 1.5, 0.75, 0].join(':'), 'point moved sideways frame 1');

	scene.setFrame(2);
	let render_target2 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [4, 2, 1, 0].join(':'), 'point moved sideways frame 2');

	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [5, 2.5, 1.25, 0].join(':'), 'point moved sideways frame 3');

	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [6, 3, 1.5, 0].join(':'), 'point moved sideways frame 4');

	RendererUtils.dispose();
});

QUnit.test('ParticlesSystemGPU params can be used from inside a subnet', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const sopadd1 = geo1.createNode('add');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0, 'no children');
	const {output1, globals1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2, '2 children');

	sopadd1.p.createPoint.set(1);
	sopadd1.p.position.set([1, 0.5, 0.25]);
	particles1.setInput(0, sopadd1);

	// we set up an attribute inside a subnet
	const subnet1 = particles1.createNode('subnet');
	subnet1.p.inputsCount.set(1);
	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	const subnet1_subnetInput1 = subnet1.createNode('subnetInput');
	const subnet1_subnetOutput1 = subnet1.createNode('subnetOutput');
	const param1 = subnet1.createNode('param');
	const add1 = subnet1.createNode('add');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('myCustomParam');
	add1.setInput(0, param1);
	add1.setInput(1, subnet1_subnetInput1);
	subnet1_subnetOutput1.setInput(0, add1);
	subnet1.setInput(0, globals1, 'position');
	output1.setInput('position', subnet1);

	scene.setFrame(1);
	await particles1.compute();

	const spareParam = particles1.params.get('myCustomParam')! as Vector3Param;
	assert.ok(spareParam);
	spareParam.set([-1, 2, -4]);

	const render_material = particles1.renderController.material()!;
	const uniform = render_material.uniforms.texture_position;

	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [1, 0.5, 0.25, 0].join(':'), 'point moved sideways frame 1');

	spareParam.set([3, 5, 6]);
	scene.setFrame(2);
	let render_target2 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [4, 5.5, 6.25, 0].join(':'), 'point moved sideways frame 2');

	spareParam.set([7, 0.5, 33]);
	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [11, 6, 39.25, 0].join(':'), 'point moved sideways frame 3');

	spareParam.set([27, 123, 4033]);
	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [38, 129, 4072.25, 0].join(':'), 'point moved sideways frame 4');

	RendererUtils.dispose();
});

QUnit.test('ParticlesSystemGPU: 2 gl/attribute with same attrib name do not trigger a redefinition', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);

	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer, 'renderer created');

	const sopadd1 = geo1.createNode('add');
	const particles1 = geo1.createNode('particlesSystemGpu');
	assert.equal(particles1.children().length, 0, 'no children');
	const {output1} = create_required_nodes(particles1);
	assert.equal(particles1.children().length, 2, '2 children');

	sopadd1.p.createPoint.set(1);
	sopadd1.p.position.set([1, 0.5, 0.25]);
	particles1.setInput(0, sopadd1);

	// we set up an attribute inside a subnet
	const attribute1 = particles1.createNode('attribute');
	const attribute2 = particles1.createNode('attribute');
	attribute1.p.name.set('test');
	attribute2.p.name.set('test');
	attribute1.setGlType(GlConnectionPointType.VEC3);
	attribute2.setGlType(GlConnectionPointType.VEC3);
	const add1 = particles1.createNode('add');
	add1.setInput(0, attribute1);
	add1.setInput(1, attribute2);
	output1.setInput('position', add1);

	scene.setFrame(1);
	await particles1.compute();

	const materials = particles1.gpuController.materials();
	assert.equal(materials.length, 1);
	const material = materials[0];
	assert.includes(
		material.fragmentShader,
		`
	// /geo1/particlesSystemGpu1/attribute1
	vec3 v_POLY_attribute1_val = texture2D( texture_test, particleUV ).xyz;
	
	// /geo1/particlesSystemGpu1/attribute2
	vec3 v_POLY_attribute2_val = texture2D( texture_test, particleUV ).xyz;
`
	);

	RendererUtils.dispose();
});
