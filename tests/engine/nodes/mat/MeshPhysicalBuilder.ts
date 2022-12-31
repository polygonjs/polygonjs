import {BaseGlShaderAssembler} from './../../../../src/engine/nodes/gl/code/assemblers/_Base';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {DoubleSide} from 'three';
import BasicDefaultVertex from './templates/meshPhysicalBuilder/Physical.default.vert.glsl';
import BasicDefaultFragment from './templates/meshPhysicalBuilder/Physical.default.frag.glsl';
import BasicSSSVertex from './templates/meshPhysicalBuilder/Physical.sss.vert.glsl';
import BasicSSSFragment from './templates/meshPhysicalBuilder/Physical.sss.frag.glsl';
import BasicSetBuilderNodeVertex from './templates/meshPhysicalBuilder/Physical.setBuilderNode.vert.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {MeshPhysicalBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshPhysicalBuilder';
import {checkConsolePrints} from '../../../helpers/Console';
import {GLSLHelper} from '../../../helpers/GLSLHelper';
import {CoreSleep} from '../../../../src/core/Sleep';
const TEST_SHADER_LIB_DEFAULT = {vert: BasicDefaultVertex, frag: BasicDefaultFragment};
const TEST_SHADER_LIB_SSS = {vert: BasicSSSVertex, frag: BasicSSSFragment};
const TEST_SHADER_LIB_SET_BUILDER_NODE = {vert: BasicSetBuilderNodeVertex};

QUnit.test('mesh physical builder persisted_config', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_physical1 = MAT.createNode('meshPhysicalBuilder');
	mesh_physical1.createNode('output');
	mesh_physical1.createNode('globals');
	const output1 = mesh_physical1.nodesByType('output')[0];
	const globals1 = mesh_physical1.nodesByType('globals')[0];
	const param1 = mesh_physical1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = mesh_physical1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = mesh_physical1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);
	await RendererUtils.compile(mesh_physical1, renderer);
	const mesh_physical1Material = await mesh_physical1.material();

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(mesh_physical1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_physical1 = scene2.node('/MAT/meshPhysicalBuilder1') as MeshPhysicalBuilderMatNode;
		assert.notOk(new_mesh_physical1.assemblerController());
		assert.ok(new_mesh_physical1.persisted_config);
		const float_param = new_mesh_physical1.params.get('float_param') as FloatParam;
		const vec3_param = new_mesh_physical1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param, 'float_param exists');
		assert.ok(vec3_param, 'vec3_param exists');
		const material = await new_mesh_physical1.material();
		await RendererUtils.compile(new_mesh_physical1, renderer);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(mesh_physical1Material.fragmentShader),
			'fragment shader is as expected'
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(mesh_physical1Material.vertexShader),
			'vertex shader is as expected'
		);

		// float param callback
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 0);
		float_param.set(2);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 2);
		float_param.set(4);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 4);

		// vector3 param callback
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[0, 0, 0]
		);
		vec3_param.set([1, 2, 3]);
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[1, 2, 3]
		);
		vec3_param.set([5, 6, 7]);
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[5, 6, 7]
		);
	});
	RendererUtils.dispose();
});

QUnit.test('mesh physical builder persisted_config with advanced params', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_physical1 = MAT.createNode('meshPhysicalBuilder');
	mesh_physical1.createNode('output');
	mesh_physical1.createNode('globals');
	const output1 = mesh_physical1.nodesByType('output')[0];
	const globals1 = mesh_physical1.nodesByType('globals')[0];
	const param1 = mesh_physical1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = mesh_physical1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = mesh_physical1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);

	mesh_physical1.p.overrideShadowSide.set(true);
	mesh_physical1.p.shadowDoubleSided.set(true);

	await RendererUtils.compile(mesh_physical1, renderer);
	const mesh_physical_mat = await mesh_physical1.material();

	assert.equal(mesh_physical_mat.shadowSide, DoubleSide);

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(mesh_physical1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_physical1 = scene2.node('/MAT/meshPhysicalBuilder1') as MeshPhysicalBuilderMatNode;
		assert.notOk(new_mesh_physical1.assemblerController());
		assert.ok(new_mesh_physical1.persisted_config);
		const float_param = new_mesh_physical1.params.get('float_param') as FloatParam;
		const vec3_param = new_mesh_physical1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param, 'float_param exists');
		assert.ok(vec3_param, 'vec3_param exists');
		const material = await new_mesh_physical1.material();
		await RendererUtils.compile(new_mesh_physical1, renderer);
		assert.equal(material.shadowSide, DoubleSide);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(mesh_physical_mat.fragmentShader),
			'fragment shader is as expected'
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(mesh_physical_mat.vertexShader),
			'vertex shader is as expected'
		);

		// float param callback
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 0);
		float_param.set(2);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 2);
		float_param.set(4);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_float_param.value, 4);

		// vector3 param callback
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[0, 0, 0]
		);
		vec3_param.set([1, 2, 3]);
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[1, 2, 3]
		);
		vec3_param.set([5, 6, 7]);
		assert.deepEqual(
			MaterialUserDataUniforms.getUniforms(material)!.v_POLY_param_vec3_param.value.toArray(),
			[5, 6, 7]
		);
	});
	RendererUtils.dispose();
});

QUnit.test('mesh physical builder SSS Model', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_physical1 = MAT.createNode('meshPhysicalBuilder');
	mesh_physical1.createNode('output');
	mesh_physical1.createNode('globals');
	const output1 = mesh_physical1.nodesByType('output')[0];
	const globals1 = mesh_physical1.nodesByType('globals')[0];
	const param1 = mesh_physical1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = mesh_physical1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = mesh_physical1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);

	mesh_physical1.p.overrideShadowSide.set(true);
	mesh_physical1.p.shadowDoubleSided.set(true);

	await RendererUtils.compile(mesh_physical1, renderer);
	const material = await mesh_physical1.material();

	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB_DEFAULT.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB_DEFAULT.frag));

	const SSSModel = mesh_physical1.createNode('SSSModel');
	output1.setInput('SSSModel', SSSModel);
	await RendererUtils.compile(mesh_physical1, renderer);

	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB_SSS.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB_SSS.frag));
	RendererUtils.dispose();
});

QUnit.test('mesh physical builder can compile from another node', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_physical_SRC = MAT.createNode('meshPhysicalBuilder');
	const mesh_physical_DEST = MAT.createNode('meshPhysicalBuilder');
	mesh_physical_SRC.createNode('output');
	mesh_physical_SRC.createNode('globals');
	const noise = mesh_physical_SRC.createNode('noise');
	const output1 = mesh_physical_SRC.nodesByType('output')[0];
	const globals1 = mesh_physical_SRC.nodesByType('globals')[0];

	noise.setInput('position', globals1, 'position');
	output1.setInput('position', noise);

	await RendererUtils.compile(mesh_physical_SRC, renderer);
	const consoleHistory = await checkConsolePrints(async () => {
		await RendererUtils.compile(mesh_physical_DEST, renderer);
	});
	assert.equal(consoleHistory.error.length, 1, 'dest mat compilation raised a webgl error');
	const mat_SRC = await mesh_physical_SRC.material();
	const mat_DEST = await mesh_physical_DEST.material();

	assert.equal(GLSLHelper.compress(mat_SRC.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB_SET_BUILDER_NODE.vert));
	assert.notEqual(GLSLHelper.compress(mat_SRC.vertexShader), GLSLHelper.compress(mat_DEST.vertexShader));

	mesh_physical_DEST.p.setBuilderNode.set(true);
	mesh_physical_DEST.p.builderNode.setNode(mesh_physical_SRC);
	await RendererUtils.compile(mesh_physical_DEST, renderer);
	assert.equal(GLSLHelper.compress(mat_SRC.vertexShader), GLSLHelper.compress(mat_DEST.vertexShader));
	RendererUtils.dispose();
});

QUnit.test('mat/meshPhysicalBuilder can select which customMat is created', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const scene = window.scene;
	const meshPhysicalBuilder1 = MAT.createNode('meshPhysicalBuilder');
	const output1 = meshPhysicalBuilder1.createNode('output');
	const globals1 = meshPhysicalBuilder1.createNode('globals');
	output1.setInput('color', globals1, 'position');

	// we need to create a spotlight and assign the material for the customDepthMaterial to be compile
	// const camera = scene.createNode('perspectiveCamera');
	const spotLight = scene.createNode('spotLight');
	spotLight.p.t.set([2, 2, 2]);
	spotLight.p.castShadow.set(true);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	material1.setInput(0, box1);
	material1.p.material.setNode(meshPhysicalBuilder1);
	material1.flags.display.set(true);
	await material1.compute();
	await CoreSleep.sleep(100);

	const geoSopGroup = scene.threejsScene().getObjectByName('geo1:sopGroup');
	assert.ok(geoSopGroup);
	assert.equal(geoSopGroup!.children.length, 1);

	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshPhysicalBuilder1.p.overrideCustomMaterials.set(1);
	await meshPhysicalBuilder1.compute();
	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshPhysicalBuilder1.p.createCustomMatDistance.set(0);
	await meshPhysicalBuilder1.compute();
	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	assert.notOk((await meshPhysicalBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshPhysicalBuilder1.p.createCustomMatDepth.set(0);
	await meshPhysicalBuilder1.compute();
	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	assert.notOk((await meshPhysicalBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.notOk((await meshPhysicalBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshPhysicalBuilder1.p.createCustomMatDepthDOF.set(0);
	await meshPhysicalBuilder1.compute();
	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	assert.notOk((await meshPhysicalBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.notOk((await meshPhysicalBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.notOk((await meshPhysicalBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshPhysicalBuilder1.p.overrideCustomMaterials.set(0);
	await meshPhysicalBuilder1.compute();
	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshPhysicalBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	RendererUtils.dispose();
});

QUnit.test('mat/meshPhysicalBuilder override thickness and transmission', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const scene = window.scene;
	const meshPhysicalBuilder1 = MAT.createNode('meshPhysicalBuilder');
	const output1 = meshPhysicalBuilder1.createNode('output');
	// const globals1 = meshPhysicalBuilder1.createNode('globals');
	const constant_transmission = meshPhysicalBuilder1.createNode('constant');
	constant_transmission.setGlType(GlConnectionPointType.FLOAT);
	constant_transmission.setName('transmission');
	constant_transmission.p.float.set(0.2);
	const constant_thickness = meshPhysicalBuilder1.createNode('constant');
	constant_thickness.setGlType(GlConnectionPointType.FLOAT);
	constant_thickness.setName('thickness');
	constant_thickness.p.float.set(0.3);

	const spotLight = scene.createNode('spotLight');
	spotLight.p.t.set([2, 2, 2]);
	spotLight.p.castShadow.set(true);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	material1.setInput(0, box1);
	material1.p.material.setNode(meshPhysicalBuilder1);
	material1.flags.display.set(true);
	await material1.compute();
	await CoreSleep.sleep(100);

	const geoSopGroup = scene.threejsScene().getObjectByName('geo1:sopGroup');
	assert.ok(geoSopGroup);
	assert.equal(geoSopGroup!.children.length, 1);

	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	let expandedFragment = BaseGlShaderAssembler.expandShader((await meshPhysicalBuilder1.material()).fragmentShader);

	assert.includes(expandedFragment, 'float POLY_thickness = 1.0;');
	assert.includes(expandedFragment, 'float POLY_transmission = 1.0;');
	assert.includes(
		BaseGlShaderAssembler.expandShader((await meshPhysicalBuilder1.material()).fragmentShader),
		'material.thickness = thickness * POLY_thickness;'
	);
	assert.includes(
		BaseGlShaderAssembler.expandShader((await meshPhysicalBuilder1.material()).fragmentShader),
		'material.transmission = transmission * POLY_transmission;'
	);

	// override
	output1.setInput('transmission', constant_transmission);
	output1.setInput('thickness', constant_thickness);
	await RendererUtils.compile(meshPhysicalBuilder1, renderer);
	expandedFragment = BaseGlShaderAssembler.expandShader((await meshPhysicalBuilder1.material()).fragmentShader);

	assert.includes(expandedFragment, 'float v_POLY_thickness_val = 0.3;');
	assert.includes(expandedFragment, 'float POLY_thickness = v_POLY_thickness_val;');
	assert.includes(expandedFragment, 'float v_POLY_transmission_val = 0.2;');
	assert.includes(expandedFragment, 'float POLY_transmission = v_POLY_transmission_val;');
	assert.includes(
		BaseGlShaderAssembler.expandShader((await meshPhysicalBuilder1.material()).fragmentShader),
		'material.thickness = thickness * POLY_thickness;'
	);
	assert.includes(
		BaseGlShaderAssembler.expandShader((await meshPhysicalBuilder1.material()).fragmentShader),
		'material.transmission = transmission * POLY_transmission;'
	);

	RendererUtils.dispose();
});
