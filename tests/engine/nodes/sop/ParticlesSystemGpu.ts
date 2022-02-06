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
import {ParticlesSceneSetup1} from './particlesSystemGPU/scenes/ParticlesSceneSetup1';
import {ParticlesSceneSetup2} from './particlesSystemGPU/scenes/ParticlesSceneSetup2';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import ADD from './particlesSystemGPU/templates/add.glsl';
import RESTP from './particlesSystemGPU/templates/restP.glsl';
const TEMPLATES = {
	ADD,
	RESTP,
};

export function createRequiredNodesForParticles(particles1: ParticlesSystemGpuSopNode) {
	// create output and globals
	const output1 = particles1.createNode('output');
	const globals1 = particles1.createNode('globals');
	// create material
	const MAT = window.MAT;
	const pointsBuilder1 = MAT.createNode('pointsBuilder');
	pointsBuilder1.createNode('output');
	particles1.p.material.set(pointsBuilder1.path());

	return {output1, globals1, pointsBuilder1};
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
	const {output1, globals1, pointsBuilder1} = createRequiredNodesForParticles(particles1);
	assert.equal(particles1.children().length, 2, 'has 2 children');

	const add1 = particles1.createNode('add');
	add1.setInput(0, globals1, 'position');
	output1.setInput('position', add1);
	add1.params.get('add1')!.set([0, 1, 0]);

	plane1.p.size.set([2, 2]);
	plane1.p.useSegmentsCount.set(1);
	delete1.setAttribClass(AttribClass.OBJECT);
	delete1.p.byExpression.set(1);
	delete1.p.keepPoints.set(1);
	delete1.setInput(0, plane1);
	particles1.setInput(0, delete1);

	scene.setFrame(1);
	await particles1.compute();
	await RendererUtils.compile(pointsBuilder1, renderer);
	const render_material = particles1.renderController.material()!;
	const uniform = MaterialUserDataUniforms.getUniforms(render_material)!.texture_position;

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
	const {output1, globals1, pointsBuilder1} = createRequiredNodesForParticles(particles1);
	assert.equal(particles1.children().length, 2, '2 children');

	plane1.p.size.set([2, 2]);
	plane1.p.useSegmentsCount.set(1);
	delete1.setAttribClass(AttribClass.OBJECT);
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
	await RendererUtils.compile(pointsBuilder1, renderer);
	assert.ok(renderMaterial, 'material ok');
	const uniform = MaterialUserDataUniforms.getUniforms(renderMaterial)!.texture_position;
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
		assert.notOk(new_particles1.assemblerController());
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
			AssertUtils.arrayWithPrecision(pixelBuffer),
			[-1, 0, -2, 0].join(':'),
			'point with persisted config moved x'
		);

		scene2.setFrame(2);
		render_target2 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.arrayWithPrecision(pixelBuffer),
			[-1, 0, -4, 0].join(':'),
			'point with persisted config moved x'
		);

		test_param2.set([0, 2, 0]);
		scene2.setFrame(3);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.arrayWithPrecision(pixelBuffer),
			[-2, 2, -5, 0].join(':'),
			'point with persisted config moved y'
		);

		// and if we set the active param to 0, nothing moves
		scene2.setFrame(4);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(AssertUtils.arrayWithPrecision(pixelBuffer), [-3, 4, -6, 0].join(':'), 'active still on');
		new_particles1.p.active.set(0);
		scene2.setFrame(5);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(AssertUtils.arrayWithPrecision(pixelBuffer), [-3, 4, -6, 0].join(':'), 'active now off');
		scene2.setFrame(6);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(AssertUtils.arrayWithPrecision(pixelBuffer), [-3, 4, -6, 0].join(':'), 'active still off');
		// and if we set the active param back to 1, particles move again
		new_particles1.p.active.set(1);
		scene2.setFrame(7);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.arrayWithPrecision(pixelBuffer),
			[-4, 6, -7, 0].join(':'),
			'point with persisted config moved y'
		);
		scene2.setFrame(8);
		render_target1 = new_particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
		renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
		assert.deepEqual(
			AssertUtils.arrayWithPrecision(pixelBuffer),
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

	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer);
	const box = geo1.createNode('box');
	box.flags.display.set(true);

	const {particlesSystemGpu1} = ParticlesSceneSetup2();

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
	const {particlesSystemGpu1, pointsBuilder1, attribute_randomId_read, attribute_randomId_export} =
		ParticlesSceneSetup1();

	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const {renderer} = await RendererUtils.waitForRenderer();
	assert.ok(renderer);

	await particlesSystemGpu1.compute();
	const material = pointsBuilder1.material;
	await RendererUtils.compile(pointsBuilder1, renderer);

	// with attrib exported from particles
	assert.includes(
		material.vertexShader,
		'vec3 transformed = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).xyz;'
	);
	assert.includes(
		material.fragmentShader,
		'float v_POLY_attribute1_val = texture2D( texture_position_SEPARATOR_randomId, particles_sim_uv_varying ).w;'
	);
	assert.deepEqual(
		particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations,
		{
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
		},
		'texture allocation ok'
	);

	// with attrib exported from particles
	attribute_randomId_export.setInput(0, null);
	await particlesSystemGpu1.compute();
	await RendererUtils.compile(pointsBuilder1, renderer);
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
	await RendererUtils.compile(pointsBuilder1, renderer);
	assert.deepEqual(
		particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations,
		{
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
		},
		'texture allocation ok after setInput again'
	);
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
	await RendererUtils.compile(pointsBuilder1, renderer);
	assert.deepEqual(
		particlesSystemGpu1.persisted_config.toJSON()?.texture_allocations,
		{
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
		},
		'texture allocation ok after attrib name change'
	);
	assert.includes(
		material.vertexShader,
		`vec3 transformed = texture2D( texture_position_SEPARATOR_otherAttrib, particles_sim_uv_varying ).xyz;`
	);
	assert.includes(material.fragmentShader, `float v_POLY_attribute1_val = v_POLY_attribute_randomId;`);

	RendererUtils.dispose();
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
	const {output1, globals1, pointsBuilder1} = createRequiredNodesForParticles(particles1);
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
	await RendererUtils.compile(pointsBuilder1, renderer);
	const render_material = particles1.renderController.material()!;
	const uniform = MaterialUserDataUniforms.getUniforms(render_material)!.texture_position;

	assert.ok(render_material, 'material ok');
	assert.ok(uniform, 'uniform ok');

	const buffer_width = 1;
	const buffer_height = 1;
	let render_target1 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture on frame 1');
	let pixelBuffer = new Float32Array(buffer_width * buffer_height * 4);
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [3, 1.5, 0.75, 0].join(':'), 'point moved sideways frame 1');

	scene.setFrame(2);
	let render_target2 = particles1.gpuController.getCurrentRenderTarget('position' as ShaderName)!;
	assert.notEqual(render_target2.texture.uuid, render_target1.texture.uuid);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture on frame 2');
	renderer.readRenderTargetPixels(render_target2, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [4, 2, 1, 0].join(':'), 'point moved sideways frame 2');

	scene.setFrame(3);
	assert.equal(uniform.value.uuid, render_target1.texture.uuid, 'uniform has expected texture on frame 3');
	renderer.readRenderTargetPixels(render_target1, 0, 0, buffer_width, buffer_height, pixelBuffer);
	assert.deepEqual(pixelBuffer.join(':'), [5, 2.5, 1.25, 0].join(':'), 'point moved sideways frame 3');

	scene.setFrame(4);
	assert.equal(uniform.value.uuid, render_target2.texture.uuid, 'uniform has expected texture on frame 4');
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
	const {output1, globals1, pointsBuilder1} = createRequiredNodesForParticles(particles1);
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
	await RendererUtils.compile(pointsBuilder1, renderer);
	const uniform = MaterialUserDataUniforms.getUniforms(render_material)!.texture_position;

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
	const {output1} = createRequiredNodesForParticles(particles1);
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
