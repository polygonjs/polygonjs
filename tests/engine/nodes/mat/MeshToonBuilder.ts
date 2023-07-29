import type {QUnit} from '../../../helpers/QUnit';
import {UniformsUtils} from 'three';
import {ShaderLib} from 'three';
import {GlobalsGlNode} from '../../../../src/engine/nodes/gl/Globals';
import {OutputGlNode} from '../../../../src/engine/nodes/gl/Output';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {ConstantGlNode} from '../../../../src/engine/nodes/gl/Constant';
import BasicDefaultVertex from './templates/meshToonBuilder/Basic.default.vert.glsl';
import BasicDefaultFragment from './templates/meshToonBuilder/Basic.default.frag.glsl';
import BasicMinimalVertex from './templates/meshToonBuilder/Basic.minimal.vert.glsl';
import BasicMinimalFragment from './templates/meshToonBuilder/Basic.minimal.frag.glsl';
import BasicPositionVertex from './templates/meshToonBuilder/Basic.position.vert.glsl';
import BasicPositionFragment from './templates/meshToonBuilder/Basic.position.frag.glsl';
import BasicPositionXZVertex from './templates/meshToonBuilder/Basic.positionXZ.vert.glsl';
import BasicPositionXZFragment from './templates/meshToonBuilder/Basic.positionXZ.frag.glsl';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {GLSLHelper} from '../../../helpers/GLSLHelper';
export function testenginenodesmatMeshToonBuilder(qUnit: QUnit) {

const TEST_SHADER_LIB = {
	default: {vert: BasicDefaultVertex, frag: BasicDefaultFragment},
	minimal: {vert: BasicMinimalVertex, frag: BasicMinimalFragment},
	position: {vert: BasicPositionVertex, frag: BasicPositionFragment},
	positionXZ: {vert: BasicPositionXZVertex, frag: BasicPositionXZFragment},
};

const BASIC_UNIFORMS = UniformsUtils.clone(ShaderLib.toon.uniforms);
const BASIC_UNIFORM_NAMES = Object.keys(BASIC_UNIFORMS).concat(['clippingPlanes']).sort();

qUnit.test('mat/meshToonBuilder simple', async (assert) => {
	const {renderer} = await RendererUtils.waitForRenderer(window.scene);
	const MAT = window.MAT;
	// const debug = MAT.createNode('test')
	const meshToon1 = MAT.createNode('meshToonBuilder');
	meshToon1.createNode('output');
	meshToon1.createNode('globals');
	const material = await meshToon1.material();
	const globals1: GlobalsGlNode = meshToon1.node('globals1')! as GlobalsGlNode;
	const output1: OutputGlNode = meshToon1.node('output1')! as OutputGlNode;

	await RendererUtils.compile(meshToon1, renderer);
	assert.equal(GLSLHelper.compress(material.vertexShader), GLSLHelper.compress(TEST_SHADER_LIB.default.vert));
	assert.equal(GLSLHelper.compress(material.fragmentShader), GLSLHelper.compress(TEST_SHADER_LIB.default.frag));
	assert.deepEqual(Object.keys(MaterialUserDataUniforms.getUniforms(material)!).sort(), BASIC_UNIFORM_NAMES);

	const constant1 = meshToon1.createNode('constant');
	constant1.setGlType(GlConnectionPointType.VEC3);
	constant1.p.vec3.set([1, 0, 0.5]);
	output1.setInput('color', constant1, ConstantGlNode.OUTPUT_NAME);
	// output1.p.color.set([1, 0, 0.5]);
	await RendererUtils.compile(meshToon1, renderer);
	// await mesh_basic1.compute();
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.minimal.vert),
		'minimal.vert'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.minimal.frag),
		'minimal.frag'
	);
	output1.setInput('color', globals1, 'position');

	await RendererUtils.compile(meshToon1, renderer);
	// await mesh_basic1.compute();
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.position.vert),
		'position.vert'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.position.frag),
		'position.frag'
	);

	const vec3ToFloat1 = meshToon1.createNode('vec3ToFloat');
	const float_to_vec3_1 = meshToon1.createNode('floatToVec3');
	float_to_vec3_1.setInput('x', vec3ToFloat1, 'x');
	float_to_vec3_1.setInput('z', vec3ToFloat1, 'y');
	vec3ToFloat1.setInput('vec', globals1, 'position');
	output1.setInput('color', float_to_vec3_1);

	await RendererUtils.compile(meshToon1, renderer);
	// await mesh_basic1.compute();

	//assert.equal(material.lights, false);
	assert.equal(
		GLSLHelper.compress(material.vertexShader),
		GLSLHelper.compress(TEST_SHADER_LIB.positionXZ.vert),
		'positionXZ.vert'
	);
	assert.equal(
		GLSLHelper.compress(material.fragmentShader),
		GLSLHelper.compress(TEST_SHADER_LIB.positionXZ.frag),
		'positionXZ.frag'
	);

	// add frame dependency
	const float_to_vec3_2 = meshToon1.createNode('floatToVec3');
	float_to_vec3_2.setInput('z', globals1, 'time');
	output1.setInput('position', float_to_vec3_2, 'vec3');
	await RendererUtils.compile(meshToon1, renderer);
	// await mesh_basic1.compute();
	assert.deepEqual(
		Object.keys(MaterialUserDataUniforms.getUniforms(material)!).sort(),
		BASIC_UNIFORM_NAMES.concat(['time']).sort()
	);

	RendererUtils.dispose();
});

}