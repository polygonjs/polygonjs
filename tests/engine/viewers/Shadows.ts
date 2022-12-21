import {RendererUtils} from '../../helpers/RendererUtils';
import {PolyScene} from '../../../src/engine/scene/PolyScene';
import {BaseBuilderMatNodeType} from '../../../src/engine/nodes/mat/_BaseBuilder';
import {CoreSleep} from '../../../src/core/Sleep';
import {GlConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Gl';
import {Vector3Param} from '../../../src/engine/params/Vector3';
import {ShaderMaterial} from 'three';
import {Scene, Camera} from 'three';

// mesh
import MESH_BASIC_DEPTH_VERTEX from './templates/meshBasicBuilder/customDepthMaterial.vert.glsl';
import MESH_BASIC_DEPTH_FRAGMENT from './templates/meshBasicBuilder/customDepthMaterial.frag.glsl';
import MESH_BASIC_DISTANCE_VERTEX from './templates/meshBasicBuilder/customDistanceMaterial.vert.glsl';
import MESH_BASIC_DISTANCE_FRAGMENT from './templates/meshBasicBuilder/customDistanceMaterial.frag.glsl';
import MESH_BASIC_DOF_VERTEX from './templates/meshBasicBuilder/customDOFMaterial.vert.glsl';
import MESH_BASIC_DOF_FRAGMENT from './templates/meshBasicBuilder/customDOFMaterial.frag.glsl';
// points
import POINTS_BASIC_DEPTH_VERTEX from './templates/pointsBuilder/customDepthMaterial.vert.glsl';
import POINTS_BASIC_DEPTH_FRAGMENT from './templates/pointsBuilder/customDepthMaterial.frag.glsl';
import POINTS_BASIC_DISTANCE_VERTEX from './templates/pointsBuilder/customDistanceMaterial.vert.glsl';
import POINTS_BASIC_DISTANCE_FRAGMENT from './templates/pointsBuilder/customDistanceMaterial.frag.glsl';
import POINTS_BASIC_DOF_VERTEX from './templates/pointsBuilder/customDOFMaterial.vert.glsl';
import POINTS_BASIC_DOF_FRAGMENT from './templates/pointsBuilder/customDOFMaterial.frag.glsl';
// line
import LINE_BASIC_DEPTH_VERTEX from './templates/lineBasicBuilder/customDepthMaterial.vert.glsl';
import LINE_BASIC_DEPTH_FRAGMENT from './templates/lineBasicBuilder/customDepthMaterial.frag.glsl';
import LINE_BASIC_DISTANCE_VERTEX from './templates/lineBasicBuilder/customDistanceMaterial.vert.glsl';
import LINE_BASIC_DISTANCE_FRAGMENT from './templates/lineBasicBuilder/customDistanceMaterial.frag.glsl';
// import {BokehPass2} from '../../../src/modules/core/post_process/BokehPass2';
import {MaterialUserDataUniforms} from '../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {GLSLHelper} from '../../helpers/GLSLHelper';
import {updateObjectsWithDepthMaterial} from '../../../src/modules/core/post_process/DOFUtils';
import {AbstractRenderer} from '../../../src/engine/viewers/Common';
// import LINE_BASIC_DOF_VERTEX from './templates/lineBasicBuilder/customDOFMaterial.vert.glsl';
// import LINE_BASIC_DOF_FRAGMENT from './templates/lineBasicBuilder/customDOFMaterial.frag.glsl';

async function addLightCastingShadow(assert: Assert, scene: PolyScene, builderMatNode: BaseBuilderMatNodeType) {
	// we need to create a spotlight and assign the material for the customDepthMaterial to be compile
	const geo1 = window.geo1;
	const camera = scene.createNode('perspectiveCamera');
	// add a spotLight to test the DepthMaterial
	const spotLight = scene.createNode('spotLight');
	spotLight.p.t.set([2, 2, 2]);
	spotLight.p.castShadow.set(true);
	// add a pointLight to test the DistanceMaterial
	const pointLight = scene.createNode('pointLight');
	pointLight.p.t.set([2, 2, 2]);
	pointLight.p.castShadow.set(true);

	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	material1.setInput(0, box1);
	material1.p.material.setNode(builderMatNode);
	material1.flags.display.set(true);
	await material1.compute();
	await CoreSleep.sleep(100);

	const geoSopGroup = scene.threejsScene().getObjectByName('geo1:sopGroup');
	assert.ok(geoSopGroup);
	assert.equal(geoSopGroup!.children.length, 1);

	return {camera};
}

function renderWithDOF(scene: Scene, renderer: AbstractRenderer, camera: Camera) {
	updateObjectsWithDepthMaterial(scene, () => {
		renderer.render(window.scene.threejsScene(), camera);
	});
}

QUnit.test('depth/distance shadows work for mesh, with mat builders', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const matNode = window.MAT.createNode('meshBasicBuilder');
	const globals1 = matNode.createNode('globals');
	const output1 = matNode.createNode('output');
	const param1 = matNode.createNode('param');
	const add1 = matNode.createNode('add');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('myCustomVec');

	output1.setInput('position', add1);
	output1.setInput('color', add1);
	add1.setInput(0, globals1);
	add1.setInput(1, param1);

	const {camera} = await addLightCastingShadow(assert, window.scene, matNode);

	await RendererUtils.compile(matNode, renderer);
	await renderer.render(window.scene.threejsScene(), camera.object);
	renderWithDOF(window.scene.threejsScene(), renderer, camera.object);
	const material = matNode.material;

	const spareParam = matNode.params.get('myCustomVec') as Vector3Param;
	assert.ok(spareParam);

	const customDepthMaterial = material.customMaterials.customDepthMaterial! as ShaderMaterial;
	const customDistanceMaterial = material.customMaterials.customDistanceMaterial! as ShaderMaterial;
	const customDepthDOFMaterial = material.customMaterials.customDepthDOFMaterial! as ShaderMaterial;
	assert.ok(customDepthMaterial);
	assert.ok(customDistanceMaterial);
	assert.ok(customDepthDOFMaterial);
	assert.equal(
		GLSLHelper.compress(customDepthMaterial.vertexShader),
		GLSLHelper.compress(MESH_BASIC_DEPTH_VERTEX),
		'depth vert ok'
	);
	assert.equal(
		GLSLHelper.compress(customDepthMaterial.fragmentShader),
		GLSLHelper.compress(MESH_BASIC_DEPTH_FRAGMENT),
		'depth frag ok'
	);
	assert.equal(
		GLSLHelper.compress(customDistanceMaterial.vertexShader),
		GLSLHelper.compress(MESH_BASIC_DISTANCE_VERTEX),
		'dist vert ok'
	);
	assert.equal(
		GLSLHelper.compress(customDistanceMaterial.fragmentShader),
		GLSLHelper.compress(MESH_BASIC_DISTANCE_FRAGMENT),
		'dist frag ok'
	);
	assert.equal(
		GLSLHelper.compress(customDepthDOFMaterial.vertexShader),
		GLSLHelper.compress(MESH_BASIC_DOF_VERTEX),
		'DOF vert ok'
	);
	assert.equal(
		GLSLHelper.compress(customDepthDOFMaterial.fragmentShader),
		GLSLHelper.compress(MESH_BASIC_DOF_FRAGMENT),
		'DOF frag ok'
	);
	// check that the material has the correct vertex and fragment
	// check that creating a gl/param node creates and syncs the uniform
	const uniforms = [
		MaterialUserDataUniforms.getUniforms(customDepthMaterial)!['v_POLY_param_myCustomVec'],
		MaterialUserDataUniforms.getUniforms(customDistanceMaterial)!['v_POLY_param_myCustomVec'],
		MaterialUserDataUniforms.getUniforms(customDepthDOFMaterial)!['v_POLY_param_myCustomVec'],
	];
	for (let uniform of uniforms) {
		assert.ok(uniform);
		assert.deepEqual(uniform.value.toArray(), [0, 0, 0]);
	}
	spareParam.set([1, 2, 3]);
	for (let uniform of uniforms) {
		assert.deepEqual(uniform.value.toArray(), [1, 2, 3]);
	}

	RendererUtils.dispose();
});

QUnit.test('depth/distance shadows work for point, with mat builders', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);

	const matNode = window.MAT.createNode('pointsBuilder');
	const globals1 = matNode.createNode('globals');
	const output1 = matNode.createNode('output');
	const param1 = matNode.createNode('param');
	const add1 = matNode.createNode('add');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('myCustomVec');

	output1.setInput('position', add1);
	output1.setInput('color', add1);
	add1.setInput(0, globals1);
	add1.setInput(1, param1);

	const {camera} = await addLightCastingShadow(assert, window.scene, matNode);

	await RendererUtils.compile(matNode, renderer);
	await renderer.render(window.scene.threejsScene(), camera.object);
	renderWithDOF(window.scene.threejsScene(), renderer, camera.object);
	const material = matNode.material;

	const spareParam = matNode.params.get('myCustomVec') as Vector3Param;
	assert.ok(spareParam);

	const customDepthMaterial = material.customMaterials.customDepthMaterial! as ShaderMaterial;
	const customDistanceMaterial = material.customMaterials.customDistanceMaterial! as ShaderMaterial;
	const customDepthDOFMaterial = material.customMaterials.customDepthDOFMaterial! as ShaderMaterial;
	assert.ok(customDepthMaterial);
	assert.ok(customDistanceMaterial);
	assert.ok(customDepthDOFMaterial);
	assert.equal(customDepthMaterial.vertexShader, POINTS_BASIC_DEPTH_VERTEX, 'depth vert ok');
	assert.equal(customDepthMaterial.fragmentShader, POINTS_BASIC_DEPTH_FRAGMENT, 'depth frag ok');
	assert.equal(customDistanceMaterial.vertexShader, POINTS_BASIC_DISTANCE_VERTEX, 'dist vert ok');
	assert.equal(customDistanceMaterial.fragmentShader, POINTS_BASIC_DISTANCE_FRAGMENT, 'dist frag ok');
	assert.equal(customDepthDOFMaterial.vertexShader, POINTS_BASIC_DOF_VERTEX, 'DOF vert ok');
	assert.equal(customDepthDOFMaterial.fragmentShader, POINTS_BASIC_DOF_FRAGMENT, 'DOF frag ok');
	// check that the material has the correct vertex and fragment
	// check that creating a gl/param node creates and syncs the uniform
	const uniforms = [
		customDepthMaterial.uniforms['v_POLY_param_myCustomVec'],
		customDistanceMaterial.uniforms['v_POLY_param_myCustomVec'],
		customDepthDOFMaterial.uniforms['v_POLY_param_myCustomVec'],
	];
	for (let uniform of uniforms) {
		assert.ok(uniform);
		assert.deepEqual(uniform.value.toArray(), [0, 0, 0]);
	}
	spareParam.set([1, 2, 3]);
	for (let uniform of uniforms) {
		assert.deepEqual(uniform.value.toArray(), [1, 2, 3]);
	}

	RendererUtils.dispose();
});
QUnit.test('depth/distance shadows work for lines, with mat builders ', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);

	const matNode = window.MAT.createNode('lineBasicBuilder');
	const globals1 = matNode.createNode('globals');
	const output1 = matNode.createNode('output');
	const param1 = matNode.createNode('param');
	const add1 = matNode.createNode('add');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('myCustomVec');

	output1.setInput('position', add1);
	output1.setInput('color', add1);
	add1.setInput(0, globals1);
	add1.setInput(1, param1);

	const {camera} = await addLightCastingShadow(assert, window.scene, matNode);

	await RendererUtils.compile(matNode, renderer);
	await renderer.render(window.scene.threejsScene(), camera.object);
	renderWithDOF(window.scene.threejsScene(), renderer, camera.object);
	const material = matNode.material;

	const spareParam = matNode.params.get('myCustomVec') as Vector3Param;
	assert.ok(spareParam);

	const customDepthMaterial = material.customMaterials.customDepthMaterial! as ShaderMaterial;
	const customDistanceMaterial = material.customMaterials.customDistanceMaterial! as ShaderMaterial;
	const customDepthDOFMaterial = material.customMaterials.customDepthDOFMaterial! as ShaderMaterial;
	assert.ok(customDepthMaterial, 'depth');
	assert.ok(customDistanceMaterial, 'dist');
	assert.ok(customDepthDOFMaterial, 'DOF');
	assert.equal(customDepthMaterial.vertexShader, LINE_BASIC_DEPTH_VERTEX, 'depth vert ok');
	assert.equal(customDepthMaterial.fragmentShader, LINE_BASIC_DEPTH_FRAGMENT, 'depth frag ok');
	assert.equal(customDistanceMaterial.vertexShader, LINE_BASIC_DISTANCE_VERTEX, 'dist vert ok');
	assert.equal(customDistanceMaterial.fragmentShader, LINE_BASIC_DISTANCE_FRAGMENT, 'dist frag ok');
	// assert.equal(customDepthDOFMaterial.vertexShader, LINE_BASIC_DOF_VERTEX, 'DOF vert ok');
	// assert.equal(customDepthDOFMaterial.fragmentShader, LINE_BASIC_DOF_FRAGMENT, 'DOF frag ok');
	// check that the material has the correct vertex and fragment
	// check that creating a gl/param node creates and syncs the uniform
	const uniforms = [
		customDepthMaterial.uniforms['v_POLY_param_myCustomVec'],
		customDistanceMaterial.uniforms['v_POLY_param_myCustomVec'],
		customDepthDOFMaterial.uniforms['v_POLY_param_myCustomVec'],
	];
	for (let uniform of uniforms) {
		assert.ok(uniform);
		assert.deepEqual(uniform.value.toArray(), [0, 0, 0]);
	}
	spareParam.set([1, 2, 3]);
	for (let uniform of uniforms) {
		assert.deepEqual(uniform.value.toArray(), [1, 2, 3]);
	}

	RendererUtils.dispose();
});
