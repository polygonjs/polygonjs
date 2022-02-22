import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {SubnetGlNode} from '../../../../src/engine/nodes/gl/Subnet';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {NodePathParam} from '../../../../src/engine/params/NodePath';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {create_required_nodes_for_subnet_gl_node} from './Subnet';

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
	const {renderer} = await RendererUtils.waitForRenderer(scene);
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
	const {renderer} = await RendererUtils.waitForRenderer(scene);
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
	const {renderer} = await RendererUtils.waitForRenderer(scene);
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

QUnit.test('gl texture: 1 texture node on top level and one in a subnet work ok', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	meshBasicBuilder1.createNode('output');
	meshBasicBuilder1.createNode('globals');
	const material = meshBasicBuilder1.material;
	const output1 = meshBasicBuilder1.nodesByType('output')[0];
	meshBasicBuilder1.nodesByType('globals')[0];
	const subnet1 = meshBasicBuilder1.createNode('subnet');
	const {subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	// const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;

	const COP = window.COP;
	const image1 = COP.createNode('image');
	image1.p.url.set(`${ASSETS_ROOT}/textures/uv.jpg`);
	const container1 = await image1.compute();
	const textureObject1 = container1.texture();
	const image2 = COP.createNode('image');
	image2.p.url.set(`${ASSETS_ROOT}/textures/uv.jpg`);
	const container2 = await image2.compute();
	const textureObject2 = container2.texture();

	function createTextureNode(parent: SubnetGlNode | MeshBasicBuilderMatNode) {
		const texture1 = parent.createNode('texture');
		texture1.p.paramName.set('myTextureMap');
		return texture1;
	}

	// only 1 param in subnet
	const texture1 = createTextureNode(subnet1);
	const vec4ToVec3_1 = subnet1.createNode('vec4ToVec3');
	vec4ToVec3_1.setInput(0, texture1);
	subnet_subnetOutput1.setInput(0, vec4ToVec3_1);
	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	subnet1.setInputName(0, 'pos');
	output1.setInput('color', subnet1);

	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	let uniform = MaterialUserDataUniforms.getUniforms(material)!['v_POLY_texture_myTextureMap'];
	assert.ok(uniform);
	assert.equal(uniform.value, null);
	let spareParam = meshBasicBuilder1.params.get('myTextureMap')! as NodePathParam;
	assert.ok(spareParam);
	spareParam.setNode(image1);
	assert.equal(uniform.value.uuid, textureObject1.uuid);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/texture1
uniform sampler2D v_POLY_texture_myTextureMap;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/texture1
		vec4 v_POLY_subnet1_texture1_rgba = texture2D(v_POLY_texture_myTextureMap, vec2(0.0, 0.0));`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_subnet1_pos;`
	);

	// only 1 param out of subnet
	subnet1.removeNode(texture1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.not_includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/texture1
uniform sampler2D v_POLY_texture_myTextureMap;`,
		'uniform is not declared anymore'
	);
	spareParam = meshBasicBuilder1.params.get('myTextureMap')! as NodePathParam;
	assert.notOk(spareParam, 'spare param is removed');

	const texture2 = createTextureNode(meshBasicBuilder1);
	const vec4ToVec3_2 = meshBasicBuilder1.createNode('vec4ToVec3');
	vec4ToVec3_2.setInput(0, texture2);
	output1.setInput('color', vec4ToVec3_2);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	uniform = MaterialUserDataUniforms.getUniforms(material)!['v_POLY_texture_myTextureMap'];
	assert.ok(uniform, 'uniform exists');
	assert.equal(uniform.value.uuid, textureObject1.uuid, 'uniform value is still previous one');
	spareParam = meshBasicBuilder1.params.get('myTextureMap')! as NodePathParam;
	assert.ok(spareParam);
	spareParam.setNode(image2);
	assert.equal(uniform.value.uuid, textureObject2.uuid);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/texture1
uniform sampler2D v_POLY_texture_myTextureMap;`
	);
	// return;
	// assert.not_includes(
	// 	material.fragmentShader,
	// 	`// /MAT/meshBasicBuilder1/subnet1/vec3ToFloat1
	// 	float v_POLY_subnet1_vec3ToFloat1_x = v_POLY_param_test.x;`
	// );
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/texture1
	vec4 v_POLY_texture1_rgba = texture2D(v_POLY_texture_myTextureMap, vec2(0.0, 0.0));`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_vec4ToVec3_1_vec3;`
	);

	// and with both param nodes
	const texture3 = createTextureNode(subnet1);
	vec4ToVec3_1.setInput(0, texture3);
	const add1 = meshBasicBuilder1.createNode('add');
	add1.setInput(0, subnet1);
	add1.setInput(1, vec4ToVec3_2);
	output1.setInput('color', add1);
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(meshBasicBuilder1.assemblerController()?.compileRequired(), 'compiled is not required');
	uniform = MaterialUserDataUniforms.getUniforms(material)!['v_POLY_texture_myTextureMap'];
	assert.ok(uniform, 'uniform exists');
	assert.equal(uniform.value.uuid, textureObject2.uuid, 'uniform value is still previous one');
	spareParam = meshBasicBuilder1.params.get('myTextureMap')! as NodePathParam;
	assert.ok(spareParam);
	spareParam.setNode(image1);
	assert.equal(uniform.value.uuid, textureObject1.uuid);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/texture1
uniform sampler2D v_POLY_texture_myTextureMap;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/subnet1/texture1
		vec4 v_POLY_subnet1_texture1_rgba = texture2D(v_POLY_texture_myTextureMap, vec2(0.0, 0.0));
	
		// /MAT/meshBasicBuilder1/subnet1/vec4ToVec3_1
		vec3 v_POLY_subnet1_vec4ToVec3_1_vec3 = v_POLY_subnet1_texture1_rgba.xyz;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/texture1
	vec4 v_POLY_texture1_rgba = texture2D(v_POLY_texture_myTextureMap, vec2(0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/vec4ToVec3_1
	vec3 v_POLY_vec4ToVec3_1_vec3 = v_POLY_texture1_rgba.xyz;`
	);
	assert.includes(
		material.fragmentShader,
		`// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;`
	);

	RendererUtils.dispose();
});
