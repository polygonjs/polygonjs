import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {MeshStandardBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshStandardBuilder';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Poly} from '../../../../src/engine/Poly';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

QUnit.test('mesh standard builder persisted_config', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_standard1 = MAT.createNode('meshStandardBuilder');
	mesh_standard1.createNode('output');
	mesh_standard1.createNode('globals');
	const output1 = mesh_standard1.nodesByType('output')[0];
	const globals1 = mesh_standard1.nodesByType('globals')[0];
	const param1 = mesh_standard1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = mesh_standard1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = mesh_standard1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);
	await RendererUtils.compile(mesh_standard1, renderer);
	const mesh_standard1Material = await mesh_standard1.material();

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(mesh_standard1.usedAssembler(), async () => {
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_standard1 = scene2.node('/MAT/meshStandardBuilder1') as MeshStandardBuilderMatNode;
		assert.notOk(new_mesh_standard1.assemblerController());
		assert.ok(new_mesh_standard1.persisted_config);
		const float_param = new_mesh_standard1.params.get('float_param') as FloatParam;
		const vec3_param = new_mesh_standard1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param, 'float_param exists');
		assert.ok(vec3_param, 'vec3_param exists');
		const material = await new_mesh_standard1.material();
		await RendererUtils.compile(new_mesh_standard1, renderer);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(mesh_standard1Material.fragmentShader),
			'fragment shader is as expected'
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(mesh_standard1Material.vertexShader),
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

QUnit.test('mesh standard builder persisted_config with no node', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_standard1 = MAT.createNode('meshStandardBuilder');
	mesh_standard1.createNode('output');
	mesh_standard1.createNode('globals');
	await RendererUtils.compile(mesh_standard1, renderer);
	const mesh_standard1Material = await mesh_standard1.material();

	assert.ok(mesh_standard1Material.fragmentShader.includes('struct SSSModel {'));

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(mesh_standard1.usedAssembler(), async () => {
		Poly.setPlayerMode(true);

		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_standard1 = scene2.node('/MAT/meshStandardBuilder1') as MeshStandardBuilderMatNode;
		assert.notOk(new_mesh_standard1.assemblerController());
		assert.ok(new_mesh_standard1.persisted_config);
		const material = await new_mesh_standard1.material();
		await RendererUtils.compile(new_mesh_standard1, renderer);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(mesh_standard1Material.fragmentShader),
			'fragment shader is as expected'
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(mesh_standard1Material.vertexShader),
			'vertex shader is as expected'
		);

		// let's ensure that a recompile is not required
		new_mesh_standard1.p.shadowPCSS.set(1);
		new_mesh_standard1.p.shadowPCSS.set(0);
		await CoreSleep.sleep(10);
		assert.notOk(new_mesh_standard1.assemblerController()?.compileRequired());
		await RendererUtils.compile(new_mesh_standard1, renderer);
		await CoreSleep.sleep(100);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(mesh_standard1Material.fragmentShader),
			'fragment shader is as expected'
		);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(mesh_standard1Material.vertexShader),
			'vertex shader is as expected'
		);
	});
	RendererUtils.dispose();
});

QUnit.test('mesh standard builder persisted_config with no node but with assembler in player mode', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_standard1 = MAT.createNode('meshStandardBuilder');
	mesh_standard1.createNode('output');
	mesh_standard1.createNode('globals');
	await RendererUtils.compile(mesh_standard1, renderer);
	const mesh_standard1Material = await mesh_standard1.material();

	assert.ok(mesh_standard1Material.fragmentShader.includes('struct SSSModel {'));

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	Poly.setPlayerMode(true);

	// console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const new_mesh_standard1 = scene2.node('/MAT/meshStandardBuilder1') as MeshStandardBuilderMatNode;
	assert.ok(new_mesh_standard1.assemblerController());
	assert.ok(new_mesh_standard1.persisted_config);
	const material = await new_mesh_standard1.material();
	await RendererUtils.compile(new_mesh_standard1, renderer);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(mesh_standard1Material.fragmentShader),
		'fragment shader is as expected'
	);
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(mesh_standard1Material.vertexShader),
		'vertex shader is as expected'
	);

	// let's ensure that a recompile is not required
	new_mesh_standard1.p.shadowPCSS.set(1);
	new_mesh_standard1.p.shadowPCSS.set(0);
	// assert.ok(new_mesh_standard1.assemblerController()?.compileRequired());
	await CoreSleep.sleep(10);
	await RendererUtils.compile(new_mesh_standard1, renderer);
	await CoreSleep.sleep(100);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(mesh_standard1Material.fragmentShader),
		'fragment shader is as expected'
	);
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(mesh_standard1Material.vertexShader),
		'vertex shader is as expected'
	);

	RendererUtils.dispose();
});

QUnit.test('mat/meshStandardBuilder can select which customMat is created', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const scene = window.scene;
	const meshStandardBuilder1 = MAT.createNode('meshStandardBuilder');
	const output1 = meshStandardBuilder1.createNode('output');
	const globals1 = meshStandardBuilder1.createNode('globals');
	output1.setInput('color', globals1, 'position');

	// we need to create a spotlight and assign the material for the customDepthMaterial to be compile
	// const camera = scene.createNode('perspectiveCamera');
	const spotLight = scene.createNode('spotLight');
	spotLight.p.t.set([2, 2, 2]);
	spotLight.p.castShadow.set(true);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	material1.setInput(0, box1);
	material1.p.material.setNode(meshStandardBuilder1);
	material1.flags.display.set(true);
	await material1.compute();
	await CoreSleep.sleep(100);

	const geoSopGroup = scene.threejsScene().getObjectByName('geo1:sopGroup');
	assert.ok(geoSopGroup);
	assert.equal(geoSopGroup!.children.length, 1);

	await RendererUtils.compile(meshStandardBuilder1, renderer);
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshStandardBuilder1.p.overrideCustomMaterials.set(1);
	await meshStandardBuilder1.compute();
	await RendererUtils.compile(meshStandardBuilder1, renderer);
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshStandardBuilder1.p.createCustomMatDistance.set(0);
	await meshStandardBuilder1.compute();
	await RendererUtils.compile(meshStandardBuilder1, renderer);
	assert.notOk((await meshStandardBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshStandardBuilder1.p.createCustomMatDepth.set(0);
	await meshStandardBuilder1.compute();
	await RendererUtils.compile(meshStandardBuilder1, renderer);
	assert.notOk((await meshStandardBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.notOk((await meshStandardBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshStandardBuilder1.p.createCustomMatDepthDOF.set(0);
	await meshStandardBuilder1.compute();
	await RendererUtils.compile(meshStandardBuilder1, renderer);
	assert.notOk((await meshStandardBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.notOk((await meshStandardBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.notOk((await meshStandardBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshStandardBuilder1.p.overrideCustomMaterials.set(0);
	await meshStandardBuilder1.compute();
	await RendererUtils.compile(meshStandardBuilder1, renderer);
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok((await meshStandardBuilder1.material()).customMaterials.customDepthDOFMaterial, 'custom mat created');

	RendererUtils.dispose();
});
