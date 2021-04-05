import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';

import {GlobalsGlNode} from '../../../../src/engine/nodes/gl/Globals';
import {OutputGlNode} from '../../../../src/engine/nodes/gl/Output';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {ConstantGlNode} from '../../../../src/engine/nodes/gl/Constant';
// import {CoreSleep} from '../../../../src/core/Sleep';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';

import BasicDefaultVertex from './templates/meshBasicBuilder/Basic.default.vert.glsl';
import BasicDefaultFragment from './templates/meshBasicBuilder/Basic.default.frag.glsl';
import BasicMinimalVertex from './templates/meshBasicBuilder/Basic.minimal.vert.glsl';
import BasicMinimalFragment from './templates/meshBasicBuilder/Basic.minimal.frag.glsl';
import BasicPositionVertex from './templates/meshBasicBuilder/Basic.position.vert.glsl';
import BasicPositionFragment from './templates/meshBasicBuilder/Basic.position.frag.glsl';
import BasicPositionXZVertex from './templates/meshBasicBuilder/Basic.positionXZ.vert.glsl';
import BasicPositionXZFragment from './templates/meshBasicBuilder/Basic.positionXZ.frag.glsl';
import BasicAttribInVertexVertex from './templates/meshBasicBuilder/Basic.attribInVertex.vert.glsl';
import BasicAttribInVertexFragment from './templates/meshBasicBuilder/Basic.attribInVertex.frag.glsl';
import BasicAttribInFragmentVertex from './templates/meshBasicBuilder/Basic.attribInFragment.vert.glsl';
import BasicAttribInFragmentFragment from './templates/meshBasicBuilder/Basic.attribInFragment.frag.glsl';
import BasicAttribInFragmentOnlyVertex from './templates/meshBasicBuilder/Basic.attribInFragmentOnly.vert.glsl';
import BasicAttribInFragmentOnlyFragment from './templates/meshBasicBuilder/Basic.attribInFragmentOnly.frag.glsl';
import BasicIfThenVertex from './templates/meshBasicBuilder/Basic.IfThen.vert.glsl';
import BasicIfThenFragment from './templates/meshBasicBuilder/Basic.IfThen.frag.glsl';
import BasicIfThenRotateFragment from './templates/meshBasicBuilder/Basic.IfThenRotate.frag.glsl';
import BasicForLoopFragment from './templates/meshBasicBuilder/Basic.ForLoop.frag.glsl';
import BasicSubnetFragment from './templates/meshBasicBuilder/Basic.Subnet.frag.glsl';

import {BaseBuilderMatNodeType} from '../../../../src/engine/nodes/mat/_BaseBuilder';
import {Vec4ToVec3GlNode} from '../../../../src/engine/nodes/gl/_ConversionVecTo';
import {TextureGlNode} from '../../../../src/engine/nodes/gl/Texture';
import {GlCompareTestName} from '../../../../src/engine/nodes/gl/Compare';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';
import {create_required_nodes_for_subnet_gl_node} from '../gl/Subnet';
import {create_required_nodes_for_ifThen_gl_node} from '../gl/IfThen';
import {create_required_nodes_for_forLoop_gl_node} from '../gl/ForLoop';

const TEST_SHADER_LIB = {
	default: {vert: BasicDefaultVertex, frag: BasicDefaultFragment},
	minimal: {vert: BasicMinimalVertex, frag: BasicMinimalFragment},
	position: {vert: BasicPositionVertex, frag: BasicPositionFragment},
	positionXZ: {vert: BasicPositionXZVertex, frag: BasicPositionXZFragment},
	attribInVertex: {vert: BasicAttribInVertexVertex, frag: BasicAttribInVertexFragment},
	attribInFragment: {vert: BasicAttribInFragmentVertex, frag: BasicAttribInFragmentFragment},
	attribInFragmentOnly: {vert: BasicAttribInFragmentOnlyVertex, frag: BasicAttribInFragmentOnlyFragment},
	IfThen: {vert: BasicIfThenVertex, frag: BasicIfThenFragment},
	IfThenRotate: {vert: BasicIfThenVertex, frag: BasicIfThenRotateFragment},
	ForLoop: {vert: BasicIfThenVertex, frag: BasicForLoopFragment},
	Subnet: {vert: BasicIfThenVertex, frag: BasicSubnetFragment},
};

const BASIC_UNIFORMS = UniformsUtils.clone(ShaderLib.basic.uniforms);

QUnit.test('mesh basic builder simple', async (assert) => {
	const MAT = window.MAT;
	// const debug = MAT.createNode('test')
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = mesh_basic1.material;
	const globals1: GlobalsGlNode = mesh_basic1.node('globals1')! as GlobalsGlNode;
	const output1: OutputGlNode = mesh_basic1.node('output1')! as OutputGlNode;

	await mesh_basic1.compute();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.default.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.default.frag);
	assert.deepEqual(Object.keys(material.uniforms).sort(), Object.keys(BASIC_UNIFORMS).sort());

	const constant1 = mesh_basic1.createNode('constant');
	constant1.set_gl_type(GlConnectionPointType.VEC3);
	constant1.p.vec3.set([1, 0, 0.5]);
	output1.setInput('color', constant1, ConstantGlNode.OUTPUT_NAME);
	// output1.p.color.set([1, 0, 0.5]);
	await mesh_basic1.compute();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.minimal.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.minimal.frag);
	output1.setInput('color', globals1, 'position');

	await mesh_basic1.compute();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.position.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.position.frag);

	const vec3ToFloat1 = mesh_basic1.createNode('vec3ToFloat');
	const float_to_vec3_1 = mesh_basic1.createNode('floatToVec3');
	float_to_vec3_1.setInput('x', vec3ToFloat1, 'x');
	float_to_vec3_1.setInput('z', vec3ToFloat1, 'y');
	vec3ToFloat1.setInput('vec', globals1, 'position');
	output1.setInput('color', float_to_vec3_1);

	await mesh_basic1.compute();

	assert.equal(material.lights, false);
	assert.equal(material.vertexShader, TEST_SHADER_LIB.positionXZ.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.positionXZ.frag);

	// add frame dependency
	const float_to_vec3_2 = mesh_basic1.createNode('floatToVec3');
	float_to_vec3_2.setInput('z', globals1, 'time');
	output1.setInput('position', float_to_vec3_2, 'vec3');
	await mesh_basic1.compute();
	assert.deepEqual(Object.keys(material.uniforms).sort(), Object.keys(BASIC_UNIFORMS).concat(['time']).sort());
});

QUnit.test('mesh basic builder can save and load param configs', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	await scene.waitForCooksCompleted();

	await mesh_basic1.compute();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), []);
	assert.notOk(mesh_basic1.assemblerController?.compile_required());

	const output1 = mesh_basic1.node('output1')! as OutputGlNode;
	const attribute1 = mesh_basic1.createNode('attribute');
	const texture1 = mesh_basic1.createNode('texture');
	const vec4_to_vector1 = mesh_basic1.createNode('vec4ToVec3');
	output1.setInput('color', vec4_to_vector1, Vec4ToVec3GlNode.OUTPUT_NAME_VEC3);
	vec4_to_vector1.setInput('vec4', texture1, TextureGlNode.OUTPUT_NAME);
	texture1.setInput('uv', attribute1);
	attribute1.p.name.set('uv');
	attribute1.set_gl_type(GlConnectionPointType.VEC2);

	// await CoreSleep.sleep(50);

	assert.ok(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	await mesh_basic1.compute();
	assert.notOk(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	// mesh_basic1.param_names();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), ['textureMap'], 'spare params has textureMap');
	assert.equal(mesh_basic1.p.textureMap.value, '/COP/imageUv', 'textureMap value is "/COP/imageUv"');
	mesh_basic1.params.get('textureMap')!.set('/COP/file2');

	const data = new SceneJsonExporter(scene).data();

	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const new_mesh_basic1 = scene2.node('/MAT/meshBasicBuilder1') as BaseBuilderMatNodeType;
	await new_mesh_basic1.compute();
	assert.notOk(new_mesh_basic1.assemblerController?.compile_required(), 'compile is not required');
	assert.deepEqual(new_mesh_basic1.params.spare_names.sort(), ['textureMap'], 'spare params has textureMap');
	assert.equal(new_mesh_basic1.params.get('textureMap')?.value, '/COP/file2', 'textureMap value is "/COP/file_uv"');
});

QUnit.test(
	'mesh basic builder: attrib is declared accordingly and uses varying if used in fragment',
	async (assert) => {
		const MAT = window.MAT;
		const mesh_basic1 = MAT.createNode('meshBasicBuilder');
		mesh_basic1.createNode('output');
		mesh_basic1.createNode('globals');
		const material = mesh_basic1.material;
		const output1 = mesh_basic1.node('output1')! as OutputGlNode;
		const attribute1 = mesh_basic1.createNode('attribute');
		attribute1.p.name.set('uv');
		attribute1.set_gl_type(GlConnectionPointType.VEC2);
		const vec2ToFloat1 = mesh_basic1.createNode('vec2ToFloat');
		const float_to_vec31 = mesh_basic1.createNode('floatToVec3');
		vec2ToFloat1.setInput(0, attribute1);
		float_to_vec31.setInput('x', vec2ToFloat1, 'x');
		float_to_vec31.setInput('z', vec2ToFloat1, 'y');
		output1.setInput('position', float_to_vec31);

		assert.ok(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
		await mesh_basic1.compute();
		assert.notOk(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
		assert.equal(material.vertexShader, TEST_SHADER_LIB.attribInVertex.vert);
		assert.equal(material.fragmentShader, TEST_SHADER_LIB.attribInVertex.frag);

		// set uv to color, to have it declared to the fragment shader
		output1.setInput('color', float_to_vec31);
		await mesh_basic1.compute();
		assert.equal(material.vertexShader, TEST_SHADER_LIB.attribInFragment.vert);
		assert.equal(material.fragmentShader, TEST_SHADER_LIB.attribInFragment.frag);
		// remove uv from position, to have it declared ONLY to the fragment shader
		output1.setInput('position', null);
		await mesh_basic1.compute();
		assert.equal(material.vertexShader, TEST_SHADER_LIB.attribInFragmentOnly.vert);
		assert.equal(material.fragmentShader, TEST_SHADER_LIB.attribInFragmentOnly.frag);
	}
);

QUnit.test('mesh basic builder with ifThen', async (assert) => {
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = mesh_basic1.material;
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const vec3ToFloat1 = mesh_basic1.createNode('vec3ToFloat');
	const compare1 = mesh_basic1.createNode('compare');
	const ifThen1 = mesh_basic1.createNode('ifThen');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_ifThen_gl_node(ifThen1);
	const ifThen_subnetInput1 = subnetInput1;
	const ifThen_subnetOutput1 = subnetOutput1;
	const multAdd1 = ifThen1.createNode('multAdd');

	vec3ToFloat1.setInput(0, globals1, 'position');
	compare1.setInput(0, vec3ToFloat1, 1);
	compare1.set_test_name(GlCompareTestName.LESS_THAN);
	ifThen1.setInput(0, compare1);
	ifThen1.setInput(1, globals1, 'position');
	output1.setInput('color', ifThen1, 'position');
	multAdd1.setInput(0, ifThen_subnetInput1);
	multAdd1.params.get('mult')!.set([2, 2, 2]);
	ifThen_subnetOutput1.setInput(0, multAdd1);

	assert.ok(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	await mesh_basic1.compute();
	assert.notOk(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	assert.equal(material.vertexShader, TEST_SHADER_LIB.IfThen.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.IfThen.frag);

	// now add a node that would create a function
	const rotate1 = ifThen1.createNode('rotate');
	rotate1.setInput(0, ifThen_subnetInput1);
	ifThen_subnetOutput1.setInput(0, rotate1);
	assert.ok(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	await mesh_basic1.compute();
	assert.notOk(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	assert.equal(material.vertexShader, TEST_SHADER_LIB.IfThenRotate.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.IfThenRotate.frag);
});

QUnit.test('mesh basic builder with forLoop', async (assert) => {
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = mesh_basic1.material;
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const forLoop1 = mesh_basic1.createNode('forLoop');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_forLoop_gl_node(forLoop1);
	const forLoop_subnetInput1 = subnetInput1;
	const forLoop_subnetOutput1 = subnetOutput1;
	const add1 = forLoop1.createNode('add');

	forLoop1.setInput(0, globals1, 'position');
	output1.setInput('color', forLoop1);
	forLoop_subnetOutput1.setInput(0, add1);
	add1.setInput(0, forLoop_subnetInput1);
	add1.params.get('add1')!.set([0.1, 0.1, 0.1]);

	assert.ok(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	await mesh_basic1.compute();
	assert.notOk(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	assert.equal(material.vertexShader, TEST_SHADER_LIB.ForLoop.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.ForLoop.frag);
});

QUnit.test('mesh basic builder with subnet', async (assert) => {
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = mesh_basic1.material;
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const subnet1 = mesh_basic1.createNode('subnet');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;
	const add1 = subnet1.createNode('add');

	subnet1.setInput(0, globals1, 'position');
	output1.setInput('color', subnet1);
	subnet_subnetOutput1.setInput(0, add1);
	add1.setInput(0, subnet_subnetInput1);
	add1.params.get('add1')!.set([1.0, 0.5, 0.25]);

	assert.ok(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	await mesh_basic1.compute();
	assert.notOk(mesh_basic1.assemblerController?.compile_required(), 'compiled is required');
	assert.equal(material.vertexShader, TEST_SHADER_LIB.Subnet.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.Subnet.frag);
});

QUnit.test('mesh basic builder persisted_config', async (assert) => {
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const param1 = mesh_basic1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = mesh_basic1.createNode('param');
	param2.set_gl_type(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = mesh_basic1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);
	await mesh_basic1.compute();

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(mesh_basic1.usedAssembler(), async () => {
		console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_basic1 = scene2.node('/MAT/meshBasicBuilder1') as BaseBuilderMatNodeType;
		assert.notOk(new_mesh_basic1.assemblerController);
		assert.ok(new_mesh_basic1.persisted_config);
		const float_param = new_mesh_basic1.params.get('float_param') as FloatParam;
		const vec3_param = new_mesh_basic1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param);
		assert.ok(vec3_param);
		const material = new_mesh_basic1.material;
		assert.equal(material.fragmentShader, mesh_basic1.material.fragmentShader);
		assert.equal(material.vertexShader, mesh_basic1.material.vertexShader);

		// float param callback
		assert.equal(material.uniforms.v_POLY_param1_val.value, 0);
		float_param.set(2);
		assert.equal(material.uniforms.v_POLY_param1_val.value, 2);
		float_param.set(4);
		assert.equal(material.uniforms.v_POLY_param1_val.value, 4);

		// vector3 param callback
		assert.deepEqual(material.uniforms.v_POLY_param2_val.value.toArray(), [0, 0, 0]);
		vec3_param.set([1, 2, 3]);
		assert.deepEqual(material.uniforms.v_POLY_param2_val.value.toArray(), [1, 2, 3]);
		vec3_param.set([5, 6, 7]);
		assert.deepEqual(material.uniforms.v_POLY_param2_val.value.toArray(), [5, 6, 7]);
	});
});

QUnit.skip('mesh basic builder frame dependent', (assert) => {});

QUnit.skip('mesh basic builder bbox dependent', (assert) => {});

QUnit.skip('mesh basic builder basic instanced works without an input node', (assert) => {});
