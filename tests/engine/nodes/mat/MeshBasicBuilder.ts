import {UniformsUtils} from 'three';
import {ShaderLib} from 'three';

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
import BasicSubnetNoInputVertex from './templates/meshBasicBuilder/Basic.SubnetNoInput.vert.glsl';
import BasicSubnetNoInputFragment from './templates/meshBasicBuilder/Basic.SubnetNoInput.frag.glsl';
import BasicSubnetNoInputWithAttribVertex from './templates/meshBasicBuilder/Basic.SubnetNoInputWithAttrib.vert.glsl';
import BasicSubnetNoInputWithAttribFragment from './templates/meshBasicBuilder/Basic.SubnetNoInputWithAttrib.frag.glsl';
import BasicSubnetNoInputWithAttribOneOutVertex from './templates/meshBasicBuilder/Basic.SubnetNoInputWithAttribOneOut.vert.glsl';
import BasicSubnetNoInputWithAttribOneOutFragment from './templates/meshBasicBuilder/Basic.SubnetNoInputWithAttribOneOut.frag.glsl';

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
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';
// import {ShaderMaterial} from 'three';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {CoreSleep} from '../../../../src/core/Sleep';
import {GLSLHelper} from '../../../helpers/GLSLHelper';

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
	SubnetNoInput: {vert: BasicSubnetNoInputVertex, frag: BasicSubnetNoInputFragment},
	SubnetNoInputWithAttrib: {vert: BasicSubnetNoInputWithAttribVertex, frag: BasicSubnetNoInputWithAttribFragment},
	SubnetNoInputWithAttribOneOut: {
		vert: BasicSubnetNoInputWithAttribOneOutVertex,
		frag: BasicSubnetNoInputWithAttribOneOutFragment,
	},
};

const BASIC_UNIFORMS = UniformsUtils.clone(ShaderLib.basic.uniforms);
const BASIC_UNIFORM_NAMES = Object.keys(BASIC_UNIFORMS).concat(['clippingPlanes']).sort();

QUnit.test('mesh basic builder simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	// const debug = MAT.createNode('test')
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = await mesh_basic1.material();
	const globals1: GlobalsGlNode = mesh_basic1.node('globals1')! as GlobalsGlNode;
	const output1: OutputGlNode = mesh_basic1.node('output1')! as OutputGlNode;

	await RendererUtils.compile(mesh_basic1, renderer);
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.default.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.default.frag));
	assert.deepEqual(Object.keys(MaterialUserDataUniforms.getUniforms(material)!).sort(), BASIC_UNIFORM_NAMES);

	const constant1 = mesh_basic1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.VEC3);
	constant1.p.vec3.set([1, 0, 0.5]);
	output1.setInput('color', constant1, ConstantGlNode.OUTPUT_NAME);
	// output1.p.color.set([1, 0, 0.5]);
	await RendererUtils.compile(mesh_basic1, renderer);
	// await mesh_basic1.compute();
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.minimal.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.minimal.frag));
	output1.setInput('color', globals1, 'position');

	await RendererUtils.compile(mesh_basic1, renderer);
	// await mesh_basic1.compute();
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.position.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.position.frag));

	const vec3ToFloat1 = mesh_basic1.createNode('vec3ToFloat');
	const float_to_vec3_1 = mesh_basic1.createNode('floatToVec3');
	float_to_vec3_1.setInput('x', vec3ToFloat1, 'x');
	float_to_vec3_1.setInput('z', vec3ToFloat1, 'y');
	vec3ToFloat1.setInput('vec', globals1, 'position');
	output1.setInput('color', float_to_vec3_1);

	await RendererUtils.compile(mesh_basic1, renderer);
	// await mesh_basic1.compute();

	//assert.equal(material.lights, false);
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.positionXZ.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.positionXZ.frag));

	// add frame dependency
	const float_to_vec3_2 = mesh_basic1.createNode('floatToVec3');
	float_to_vec3_2.setInput('z', globals1, 'time');
	output1.setInput('position', float_to_vec3_2, 'vec3');
	await RendererUtils.compile(mesh_basic1, renderer);
	// await mesh_basic1.compute();
	assert.deepEqual(
		Object.keys(MaterialUserDataUniforms.getUniforms(material)!).sort(),
		BASIC_UNIFORM_NAMES.concat(['time']).sort()
	);

	RendererUtils.dispose();
});

QUnit.test('mesh basic builder can save and load param configs', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const scene = window.scene;
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	await scene.waitForCooksCompleted();

	await RendererUtils.compile(mesh_basic1, renderer);
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), []);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired());

	const output1 = mesh_basic1.node('output1')! as OutputGlNode;
	const attribute1 = mesh_basic1.createNode('attribute');
	const texture1 = mesh_basic1.createNode('texture');
	const vec4_to_vector1 = mesh_basic1.createNode('vec4ToVec3');
	output1.setInput('color', vec4_to_vector1, Vec4ToVec3GlNode.OUTPUT_NAME_VEC3);
	vec4_to_vector1.setInput('vec4', texture1, TextureGlNode.OUTPUT_NAME);
	texture1.setInput('uv', attribute1);
	attribute1.p.name.set('uv');
	attribute1.setGlType(GlConnectionPointType.VEC2);

	// await CoreSleep.sleep(50);

	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	// mesh_basic1.param_names();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), ['texture1'], 'spare params has texture1');
	assert.equal(
		mesh_basic1.params.paramWithType('texture1', ParamType.NODE_PATH)!.value.path(),
		'',
		'texture1 value is ""'
	);
	mesh_basic1.params.get('texture1')!.set('/COP/file2');

	await saveAndLoadScene(scene, async (scene2) => {
		const new_mesh_basic1 = scene2.node('/MAT/meshBasicBuilder1') as BaseBuilderMatNodeType;
		await RendererUtils.compile(new_mesh_basic1, renderer);
		assert.notOk(new_mesh_basic1.assemblerController()?.compileRequired(), 'compile is not required');
		assert.deepEqual(new_mesh_basic1.params.spare_names.sort(), ['texture1'], 'spare params has texture1');
		assert.equal(
			new_mesh_basic1.params.paramWithType('texture1', ParamType.NODE_PATH)!.value.path(),
			'/COP/file2',
			'texture1 value is "/COP/file_uv"'
		);
	});
	RendererUtils.dispose();
});

QUnit.test(
	'mesh basic builder: attrib is declared accordingly and uses varying if used in fragment',
	async (assert) => {
		const {renderer} = await RendererUtils.waitForRenderer(window.scene);
		const MAT = window.MAT;
		const mesh_basic1 = MAT.createNode('meshBasicBuilder');
		mesh_basic1.createNode('output');
		mesh_basic1.createNode('globals');
		const material = await mesh_basic1.material();
		const output1 = mesh_basic1.node('output1')! as OutputGlNode;
		const attribute1 = mesh_basic1.createNode('attribute');
		attribute1.p.name.set('uv');
		attribute1.setGlType(GlConnectionPointType.VEC2);
		const vec2ToFloat1 = mesh_basic1.createNode('vec2ToFloat');
		const float_to_vec31 = mesh_basic1.createNode('floatToVec3');
		vec2ToFloat1.setInput(0, attribute1);
		float_to_vec31.setInput('x', vec2ToFloat1, 'x');
		float_to_vec31.setInput('z', vec2ToFloat1, 'y');
		output1.setInput('position', float_to_vec31);

		assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
		await RendererUtils.compile(mesh_basic1, renderer);
		assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is not required');
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(TEST_SHADER_LIB.attribInVertex.vert),
			'TEST_SHADER_LIB.attribInVertex.vert'
		);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(TEST_SHADER_LIB.attribInVertex.frag),
			'TEST_SHADER_LIB.attribInVertex.frag'
		);

		// set uv to color, to have it declared to the fragment shader
		output1.setInput('color', float_to_vec31);
		await RendererUtils.compile(mesh_basic1, renderer);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(TEST_SHADER_LIB.attribInFragment.vert),
			'TEST_SHADER_LIB.attribInFragment.vert'
		);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(TEST_SHADER_LIB.attribInFragment.frag),
			'TEST_SHADER_LIB.attribInFragment.frag'
		);
		// remove uv from position, to have it declared ONLY to the fragment shader
		output1.setInput('position', null);
		await RendererUtils.compile(mesh_basic1, renderer);
		assert.equal(
			GLSLHelper.compress(material.vertexShader),
			GLSLHelper.compress(TEST_SHADER_LIB.attribInFragmentOnly.vert),
			'TEST_SHADER_LIB.attribInFragmentOnly.vert'
		);
		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(TEST_SHADER_LIB.attribInFragmentOnly.frag),
			'TEST_SHADER_LIB.attribInFragmentOnly.frag'
		);
		RendererUtils.dispose();
	}
);

QUnit.test('mesh basic builder with ifThen', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = await mesh_basic1.material();
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const vec3ToFloat1 = mesh_basic1.createNode('vec3ToFloat');
	const compare1 = mesh_basic1.createNode('compare');
	const ifThen1 = mesh_basic1.createNode('ifThen');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_ifThen_gl_node(ifThen1);
	const ifThen_subnetInput1 = subnetInput1;
	const ifThen_subnetOutput1 = subnetOutput1;
	const multAdd1 = ifThen1.createNode('multAdd');

	ifThen1.setInputType(0, GlConnectionPointType.VEC3);
	// ifThen1.setOutputType(0, GlConnectionPointType.VEC3);
	ifThen1.setInputName(0, 'position');
	// ifThen1.setOutputName(0, 'position');

	vec3ToFloat1.setInput(0, globals1, 'position');
	compare1.setInput(0, vec3ToFloat1, 1);
	compare1.setTestName(GlCompareTestName.LESS_THAN);
	ifThen1.setInput(0, compare1);
	ifThen1.setInput(1, globals1, 'position');
	output1.setInput('color', ifThen1, 'position');
	multAdd1.setInput(0, ifThen_subnetInput1);
	multAdd1.params.get('mult')!.set([2, 2, 2]);
	ifThen_subnetOutput1.setInput(0, multAdd1);

	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is not required');
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.IfThen.vert),
		'vertex 1'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.IfThen.frag),
		'fragment '
	);

	// now add a node that would create a function
	const rotate1 = ifThen1.createNode('rotate');
	rotate1.setInput(0, ifThen_subnetInput1);
	ifThen_subnetOutput1.setInput(0, rotate1);
	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is not required');
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.IfThenRotate.vert),
		'vertex 2'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.IfThenRotate.frag),
		'fragment 2'
	);

	RendererUtils.dispose();
});

QUnit.test('mesh basic builder with forLoop', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = await mesh_basic1.material();
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const forLoop1 = mesh_basic1.createNode('forLoop');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_forLoop_gl_node(forLoop1);
	const forLoop_subnetInput1 = subnetInput1;
	const forLoop_subnetOutput1 = subnetOutput1;
	const add1 = forLoop1.createNode('add');

	forLoop1.setInputType(0, GlConnectionPointType.VEC3);
	// forLoop1.setOutputType(0, GlConnectionPointType.VEC3);
	forLoop1.setInputName(0, 'position');
	// forLoop1.setOutputName(0, 'position');

	forLoop1.setInput(0, globals1, 'position');
	output1.setInput('color', forLoop1);
	forLoop_subnetOutput1.setInput(0, add1);
	add1.setInput(0, forLoop_subnetInput1, 4);
	add1.params.get('add1')!.set([0.1, 0.1, 0.1]);

	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.ForLoop.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.ForLoop.frag));
	RendererUtils.dispose();
});

QUnit.test('mesh basic builder with subnet', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = await mesh_basic1.material();
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const subnet1 = mesh_basic1.createNode('subnet');
	const {subnetInput1, subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;
	const add1 = subnet1.createNode('add');

	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	// subnet1.setOutputType(0, GlConnectionPointType.VEC3);
	subnet1.setInputName(0, 'position');
	// subnet1.setOutputName(0, 'position');

	subnet1.setInput(0, globals1, 'position');
	output1.setInput('color', subnet1);
	subnet_subnetOutput1.setInput(0, add1);
	add1.setInput(0, subnet_subnetInput1);
	add1.params.get('add1')!.set([1.0, 0.5, 0.25]);

	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.Subnet.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.Subnet.frag));

	RendererUtils.dispose();
});

QUnit.test('mesh basic builder with subnet without input', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = await mesh_basic1.material();
	const output1 = mesh_basic1.nodesByType('output')[0];
	mesh_basic1.nodesByType('globals')[0];
	const subnet1 = mesh_basic1.createNode('subnet');
	const {subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	// const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;
	const constant1 = subnet1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.VEC3);
	constant1.p.asColor.set(1);
	constant1.p.color.set([1, 0.5, 0.25]);
	subnet_subnetOutput1.setInput(0, constant1);

	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	subnet1.setInputName(0, 'basecolor');

	output1.setInput('color', subnet1);

	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.SubnetNoInput.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.SubnetNoInput.frag));

	RendererUtils.dispose();
});

QUnit.test('mesh basic builder with subnet without input and attributes', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const material = await mesh_basic1.material();
	const output1 = mesh_basic1.nodesByType('output')[0];
	mesh_basic1.nodesByType('globals')[0];
	const subnet1 = mesh_basic1.createNode('subnet');
	const {subnetOutput1} = create_required_nodes_for_subnet_gl_node(subnet1);
	// const subnet_subnetInput1 = subnetInput1;
	const subnet_subnetOutput1 = subnetOutput1;
	const attribute1 = subnet1.createNode('attribute');
	const attribute2 = subnet1.createNode('attribute');
	const add1 = subnet1.createNode('add');
	attribute1.setGlType(GlConnectionPointType.VEC3);
	attribute2.setGlType(GlConnectionPointType.VEC3);
	attribute1.p.name.set('attrib1');
	attribute2.p.name.set('attrib2');
	add1.setInput(0, attribute1);
	add1.setInput(1, attribute2);

	subnet_subnetOutput1.setInput(0, add1);
	subnet1.setInputType(0, GlConnectionPointType.VEC3);
	subnet1.setInputName(0, 'basecolor');

	// make sure the attribute is used in fragment,
	// so that we can test it is correctly defined in vertex shader
	output1.setInput('color', subnet1);

	// 2 attributes with different names inside the subnet
	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.SubnetNoInputWithAttrib.vert),
		'TEST_SHADER_LIB.SubnetNoInputWithAttrib.vert'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.SubnetNoInputWithAttrib.frag),
		'TEST_SHADER_LIB.SubnetNoInputWithAttrib.frag'
	);

	// 2 attributes with same names, one inside the subnet, one outside
	const attribute3 = mesh_basic1.createNode('attribute');
	const add2 = mesh_basic1.createNode('add');
	attribute3.p.name.set('attrib1');
	attribute3.setGlType(GlConnectionPointType.VEC3);
	subnet_subnetOutput1.setInput(0, attribute1);
	add2.setInput(0, subnet1);
	add2.setInput(1, attribute3);
	output1.setInput('color', add2);
	assert.ok(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.notOk(mesh_basic1.assemblerController()?.compileRequired(), 'compiled is required');
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.SubnetNoInputWithAttribOneOut.vert),
		'TEST_SHADER_LIB.SubnetNoInputWithAttribOneOut.vert'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.SubnetNoInputWithAttribOneOut.frag),
		'TEST_SHADER_LIB.SubnetNoInputWithAttribOneOut.frag'
	);

	RendererUtils.dispose();
});

QUnit.test('mesh basic builder persisted_config', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];
	const param1 = mesh_basic1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = mesh_basic1.createNode('param');
	param2.setGlType(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = mesh_basic1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput('color', float_to_vec31);
	output1.setInput('position', param2);
	await RendererUtils.compile(mesh_basic1, renderer);
	const mesh_basic1Material = await mesh_basic1.material();

	const scene = window.scene;
	const data = await new SceneJsonExporter(scene).data();
	await AssemblersUtils.withUnregisteredAssembler(mesh_basic1.usedAssembler(), async () => {
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_basic1 = scene2.node('/MAT/meshBasicBuilder1') as MeshBasicBuilderMatNode;
		assert.notOk(new_mesh_basic1.assemblerController());
		assert.ok(new_mesh_basic1.persisted_config);

		const float_param = new_mesh_basic1.params.get('float_param') as FloatParam;
		const vec3_param = new_mesh_basic1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param);
		assert.ok(vec3_param);
		const material = await new_mesh_basic1.material();
		await RendererUtils.compile(new_mesh_basic1, renderer);

		assert.equal(
			GLSLHelper.compress(material.fragmentShader),
			GLSLHelper.compress(mesh_basic1Material.fragmentShader)
		);
		assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(mesh_basic1Material.vertexShader));

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

QUnit.test('mesh basic builder frame dependent with custom mat', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const scene = window.scene;
	scene.setFrame(0);
	assert.equal(scene.time(), 0);
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	const output1 = mesh_basic1.nodesByType('output')[0];
	const globals1 = mesh_basic1.nodesByType('globals')[0];

	// we need to create a spotlight and assign the material for the customDepthMaterial to be compile
	const camera = scene.createNode('perspectiveCamera');
	const spotLight = scene.createNode('spotLight');
	spotLight.p.t.set([2, 2, 2]);
	spotLight.p.castShadow.set(true);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	material1.setInput(0, box1);
	material1.p.material.setNode(mesh_basic1);
	material1.flags.display.set(true);
	await material1.compute();
	await CoreSleep.sleep(100);

	const geoSopGroup = scene.threejsScene().getObjectByName('geo1:sopGroup');
	assert.ok(geoSopGroup);
	assert.equal(geoSopGroup!.children.length, 1);

	const meshBasicMat = await mesh_basic1.material();
	assert.notOk(MaterialUserDataUniforms.getUniforms(meshBasicMat), 'uniforms not created yet');

	output1.setInput('alpha', globals1, 'time');
	await RendererUtils.compile(mesh_basic1, renderer);
	assert.ok(meshBasicMat.customMaterials.customDepthMaterial, 'custom mat created');
	const customMat = meshBasicMat.customMaterials.customDepthMaterial!;
	assert.notOk(MaterialUserDataUniforms.getUniforms(customMat), 'custom mat not compiled yet');
	renderer.render(scene.threejsScene(), camera.object); // we also need to render to have the custom materials
	assert.ok(MaterialUserDataUniforms.getUniforms(customMat), 'custom mat uniforms compiled');
	assert.equal(scene.time(), 0);
	assert.equal(scene.uniformsController.timeUniformValue(), 0);
	assert.equal(MaterialUserDataUniforms.getUniforms(meshBasicMat)!.time.value, 0, 'time is 0 on main mat');
	assert.equal(MaterialUserDataUniforms.getUniforms(customMat)!.time.value, 0);

	scene.setFrame(60);
	assert.equal(MaterialUserDataUniforms.getUniforms(meshBasicMat)!.time.value, 1, 'time is 1 on main mat');
	assert.equal(MaterialUserDataUniforms.getUniforms(customMat)!.time.value, 1);

	await AssemblersUtils.withUnregisteredAssembler(mesh_basic1.usedAssembler(), async () => {
		await saveAndLoadScene(scene, async (scene2) => {
			scene.setFrame(10);
			await scene2.waitForCooksCompleted();

			const new_mesh_basic1 = scene2.node('/MAT/meshBasicBuilder1') as BaseBuilderMatNodeType;
			const mesh_basic2 = new_mesh_basic1;
			const meshBasic2Mat = await mesh_basic2.material();
			assert.notOk(mesh_basic2.assemblerController());
			assert.ok(mesh_basic2.persisted_config);
			assert.notOk(MaterialUserDataUniforms.getUniforms(meshBasic2Mat), 'no time uniform before compilation');
			await RendererUtils.compile(mesh_basic2, renderer);
			const customMat2 = meshBasic2Mat.customMaterials.customDepthMaterial!;
			assert.equal(
				MaterialUserDataUniforms.getUniforms(meshBasic2Mat)!.time.value,
				1,
				'time is 1 on new main mat'
			);
			await RendererUtils.compile(customMat2, renderer);
			assert.equal(MaterialUserDataUniforms.getUniforms(customMat2)!.time.value, 1);
			scene2.setFrame(120);
			assert.equal(scene2.uniformsController.timeUniformValue(), 2, 'time uniform is 2');
			assert.equal(
				MaterialUserDataUniforms.getUniforms(meshBasic2Mat)!.time.value,
				2,
				'time is 2 on new main mat'
			);
			assert.equal(MaterialUserDataUniforms.getUniforms(customMat2)!.time.value, 2, 'time is 2 on custom mat');
		});
	});

	RendererUtils.dispose();
});

QUnit.test('mesh basic builder: 2 materials will have unique customProgramCacheKey', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const scene = window.scene;
	scene.setFrame(0);
	assert.equal(scene.time(), 0);

	function createMatNode() {
		const mesh_basic1 = MAT.createNode('meshBasicBuilder');
		mesh_basic1.createNode('output');
		mesh_basic1.createNode('globals');
		const output1 = mesh_basic1.nodesByType('output')[0];
		const globals1 = mesh_basic1.nodesByType('globals')[0];
		output1.setInput('color', globals1, 'position');
		return mesh_basic1;
	}
	const mesh_basic1 = createMatNode();
	const mesh_basic2 = createMatNode();
	const meshBasic1Mat = await mesh_basic1.material();
	const meshBasic2Mat = await mesh_basic2.material();

	assert.notEqual(
		meshBasic1Mat.customProgramCacheKey(),
		meshBasic2Mat.customProgramCacheKey(),
		'cache keys are unique before compilation'
	);

	await RendererUtils.compile(mesh_basic1, renderer);
	await RendererUtils.compile(mesh_basic2, renderer);

	assert.notEqual(
		meshBasic1Mat.customProgramCacheKey(),
		meshBasic2Mat.customProgramCacheKey(),
		'just in case, cache keys are also unique after compilation'
	);

	await AssemblersUtils.withUnregisteredAssembler(mesh_basic1.usedAssembler(), async () => {
		await saveAndLoadScene(scene, async (scene2) => {
			scene.setFrame(10);
			await scene2.waitForCooksCompleted();

			const new_mesh_basic1 = scene2.node(mesh_basic1.path()) as BaseBuilderMatNodeType;
			const new_mesh_basic2 = scene2.node(mesh_basic2.path()) as BaseBuilderMatNodeType;
			const newMeshBasic1Mat = await new_mesh_basic1.material();
			const newMeshBasic2Mat = await new_mesh_basic2.material();
			assert.notOk(new_mesh_basic1.assemblerController());
			assert.notOk(new_mesh_basic2.assemblerController());
			assert.ok(new_mesh_basic1.persisted_config);
			assert.ok(new_mesh_basic2.persisted_config);
			assert.notEqual(
				newMeshBasic1Mat.customProgramCacheKey(),
				newMeshBasic2Mat.customProgramCacheKey(),
				'new cache keys are unique before compilation'
			);

			await RendererUtils.compile(new_mesh_basic1, renderer);
			await RendererUtils.compile(new_mesh_basic2, renderer);

			assert.notEqual(newMeshBasic1Mat.uuid, newMeshBasic2Mat.uuid);
			assert.notEqual(
				newMeshBasic1Mat.customProgramCacheKey(),
				newMeshBasic2Mat.customProgramCacheKey(),
				'new cache keys are unique after compilation'
			);
		});
	});

	RendererUtils.dispose();
});

QUnit.test('mat/meshBasicBuilder can select which customMat is created', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	const geo1 = window.geo1;
	const scene = window.scene;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const output1 = meshBasicBuilder1.createNode('output');
	const globals1 = meshBasicBuilder1.createNode('globals');
	output1.setInput('color', globals1, 'position');

	// we need to create a spotlight and assign the material for the customDepthMaterial to be compile
	// const camera = scene.createNode('perspectiveCamera');
	const spotLight = scene.createNode('spotLight');
	spotLight.p.t.set([2, 2, 2]);
	spotLight.p.castShadow.set(true);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	material1.setInput(0, box1);
	material1.p.material.setNode(meshBasicBuilder1);
	material1.flags.display.set(true);
	await material1.compute();
	await CoreSleep.sleep(100);

	const geoSopGroup = scene.threejsScene().getObjectByName('geo1:sopGroup');
	assert.ok(geoSopGroup);
	assert.equal(geoSopGroup!.children.length, 1);

	const material = await meshBasicBuilder1.material();

	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.ok(material.customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshBasicBuilder1.p.overrideCustomMaterials.set(1);
	await meshBasicBuilder1.compute();
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.ok(material.customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshBasicBuilder1.p.createCustomMatDistance.set(0);
	await meshBasicBuilder1.compute();
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(material.customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshBasicBuilder1.p.createCustomMatDepth.set(0);
	await meshBasicBuilder1.compute();
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(material.customMaterials.customDistanceMaterial, 'custom mat created');
	assert.notOk(material.customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshBasicBuilder1.p.createCustomMatDepthDOF.set(0);
	await meshBasicBuilder1.compute();
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.notOk(material.customMaterials.customDistanceMaterial, 'custom mat created');
	assert.notOk(material.customMaterials.customDepthMaterial, 'custom mat created');
	assert.notOk(material.customMaterials.customDepthDOFMaterial, 'custom mat created');

	meshBasicBuilder1.p.overrideCustomMaterials.set(0);
	await meshBasicBuilder1.compute();
	await RendererUtils.compile(meshBasicBuilder1, renderer);
	assert.ok(material.customMaterials.customDistanceMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthMaterial, 'custom mat created');
	assert.ok(material.customMaterials.customDepthDOFMaterial, 'custom mat created');

	RendererUtils.dispose();
});

QUnit.skip('mesh basic builder bbox dependent', (assert) => {});

QUnit.skip('mesh basic builder basic instanced works without an input node', (assert) => {});
