import {GlobalsGlNode} from '../../../../src/engine/nodes/gl/Globals';
import {OutputGlNode} from '../../../../src/engine/nodes/gl/Output';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {ConstantGlNode} from '../../../../src/engine/nodes/gl/Constant';

import BasicDefaultVertex from './templates/volume/default.vert.glsl';
import BasicDefaultFragment from './templates/volume/default.frag.glsl';
import BasicMinimalVertex from './templates/volume/minimal.vert.glsl';
import BasicMinimalFragment from './templates/volume/minimal.frag.glsl';
import BasicPositionVertex from './templates/volume/position.vert.glsl';
import BasicPositionFragment from './templates/volume/position.frag.glsl';
import {VOLUME_UNIFORMS} from '../../../../src/engine/nodes/gl/gl/volume/uniforms';

const TEST_SHADER_LIB = {
	default: {vert: BasicDefaultVertex, frag: BasicDefaultFragment},
	minimal: {vert: BasicMinimalVertex, frag: BasicMinimalFragment},
	position: {vert: BasicPositionVertex, frag: BasicPositionFragment},
};

QUnit.test('volume builder simple', async (assert) => {
	const MAT = window.MAT;
	// const debug = MAT.create_node('test')
	const volume_builder1 = MAT.create_node('volume_builder');
	const material = volume_builder1.material;
	const globals1: GlobalsGlNode = volume_builder1.node('globals1')! as GlobalsGlNode;
	const output1: OutputGlNode = volume_builder1.node('output1')! as OutputGlNode;

	await volume_builder1.request_container();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.default.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.default.frag);
	assert.deepEqual(Object.keys(material.uniforms).sort(), Object.keys(VOLUME_UNIFORMS).sort());

	const constant1 = volume_builder1.create_node('constant');
	constant1.set_gl_type(GlConnectionPointType.FLOAT);
	constant1.p.vec3.set([1, 0, 0.5]);
	output1.set_input('density', constant1, ConstantGlNode.OUTPUT_NAME);
	// output1.p.color.set([1, 0, 0.5]);
	await volume_builder1.request_container();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.minimal.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.minimal.frag);

	const vec3_to_float1 = volume_builder1.create_node('vec3_to_float');
	output1.set_input('density', vec3_to_float1, 'y');
	vec3_to_float1.set_input(0, globals1, 'position');

	await volume_builder1.request_container();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.position.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.position.frag);
});
