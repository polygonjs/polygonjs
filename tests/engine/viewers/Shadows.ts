import {ShaderMaterialWithCustomMaterials} from '../../../src/core/geometry/Material';
import {GlConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Gl';
import {Vector3Param} from '../../../src/engine/params/Vector3';

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
import LINE_BASIC_DOF_VERTEX from './templates/lineBasicBuilder/customDOFMaterial.vert.glsl';
import LINE_BASIC_DOF_FRAGMENT from './templates/lineBasicBuilder/customDOFMaterial.frag.glsl';

// TODO:
// the DOF material are actually incorrect in this test
// and need more work, at least for points and lines

QUnit.test('depth/distance shadows work for mesh, with mat builders ', async (assert) => {
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

	await matNode.compute();
	const material = matNode.material as ShaderMaterialWithCustomMaterials;

	const spareParam = matNode.params.get('myCustomVec') as Vector3Param;
	assert.ok(spareParam);

	const customDepthMaterial = material.customMaterials.customDepthMaterial!;
	const customDistanceMaterial = material.customMaterials.customDistanceMaterial!;
	const customDepthDOFMaterial = material.customMaterials.customDepthDOFMaterial!;
	assert.ok(customDepthMaterial);
	assert.ok(customDistanceMaterial);
	assert.ok(customDepthDOFMaterial);
	assert.equal(customDepthMaterial.vertexShader, MESH_BASIC_DEPTH_VERTEX, 'depth vert ok');
	assert.equal(customDepthMaterial.fragmentShader, MESH_BASIC_DEPTH_FRAGMENT, 'depth frag ok');
	assert.equal(customDistanceMaterial.vertexShader, MESH_BASIC_DISTANCE_VERTEX, 'dist vert ok');
	assert.equal(customDistanceMaterial.fragmentShader, MESH_BASIC_DISTANCE_FRAGMENT, 'dist frag ok');
	assert.equal(customDepthDOFMaterial.vertexShader, MESH_BASIC_DOF_VERTEX, 'DOF vert ok');
	assert.equal(customDepthDOFMaterial.fragmentShader, MESH_BASIC_DOF_FRAGMENT, 'DOF frag ok');
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
});

QUnit.test('depth/distance shadows work for point, with mat builders', async (assert) => {
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

	await matNode.compute();
	const material = matNode.material as ShaderMaterialWithCustomMaterials;

	const spareParam = matNode.params.get('myCustomVec') as Vector3Param;
	assert.ok(spareParam);

	const customDepthMaterial = material.customMaterials.customDepthMaterial!;
	const customDistanceMaterial = material.customMaterials.customDistanceMaterial!;
	const customDepthDOFMaterial = material.customMaterials.customDepthDOFMaterial!;
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
});
QUnit.test('depth/distance shadows work for lines, with mat builders ', async (assert) => {
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

	await matNode.compute();
	const material = matNode.material as ShaderMaterialWithCustomMaterials;

	const spareParam = matNode.params.get('myCustomVec') as Vector3Param;
	assert.ok(spareParam);

	const customDepthMaterial = material.customMaterials.customDepthMaterial!;
	const customDistanceMaterial = material.customMaterials.customDistanceMaterial!;
	const customDepthDOFMaterial = material.customMaterials.customDepthDOFMaterial!;
	assert.ok(customDepthMaterial, 'depth');
	assert.ok(customDistanceMaterial, 'dist');
	assert.ok(customDepthDOFMaterial, 'DOF');
	assert.equal(customDepthMaterial.vertexShader, LINE_BASIC_DEPTH_VERTEX, 'depth vert ok');
	assert.equal(customDepthMaterial.fragmentShader, LINE_BASIC_DEPTH_FRAGMENT, 'depth frag ok');
	assert.equal(customDistanceMaterial.vertexShader, LINE_BASIC_DISTANCE_VERTEX, 'dist vert ok');
	assert.equal(customDistanceMaterial.fragmentShader, LINE_BASIC_DISTANCE_FRAGMENT, 'dist frag ok');
	assert.equal(customDepthDOFMaterial.vertexShader, LINE_BASIC_DOF_VERTEX, 'DOF vert ok');
	assert.equal(customDepthDOFMaterial.fragmentShader, LINE_BASIC_DOF_FRAGMENT, 'DOF frag ok');
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
});
