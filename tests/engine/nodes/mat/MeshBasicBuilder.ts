import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';

import {ConnectionPointTypesAvailableForAttribute} from '../../../../src/engine/nodes/gl/Attribute';
import {GlobalsGlNode} from '../../../../src/engine/nodes/gl/Globals';
import {OutputGlNode} from '../../../../src/engine/nodes/gl/Output';
import {
	ConnectionPointTypes,
	ConnectionPointType,
} from '../../../../src/engine/nodes/utils/connections/ConnectionPointType';
import {ConstantGlNode} from '../../../../src/engine/nodes/gl/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';

import BasicDefaultVertex from './templates/mesh_basic_builder/Basic.default.vert.glsl';
import BasicDefaultFragment from './templates/mesh_basic_builder/Basic.default.frag.glsl';
import BasicMinimalVertex from './templates/mesh_basic_builder/Basic.minimal.vert.glsl';
import BasicMinimalFragment from './templates/mesh_basic_builder/Basic.minimal.frag.glsl';
import BasicPositionVertex from './templates/mesh_basic_builder/Basic.position.vert.glsl';
import BasicPositionFragment from './templates/mesh_basic_builder/Basic.position.frag.glsl';
import BasicPositionXZVertex from './templates/mesh_basic_builder/Basic.positionXZ.vert.glsl';
import BasicPositionXZFragment from './templates/mesh_basic_builder/Basic.positionXZ.frag.glsl';
import BasicAttribInVertexVertex from './templates/mesh_basic_builder/Basic.attribInVertex.vert.glsl';
import BasicAttribInVertexFragment from './templates/mesh_basic_builder/Basic.attribInVertex.frag.glsl';
import BasicAttribInFragmentVertex from './templates/mesh_basic_builder/Basic.attribInFragment.vert.glsl';
import BasicAttribInFragmentFragment from './templates/mesh_basic_builder/Basic.attribInFragment.frag.glsl';
import BasicAttribInFragmentOnlyVertex from './templates/mesh_basic_builder/Basic.attribInFragmentOnly.vert.glsl';
import BasicAttribInFragmentOnlyFragment from './templates/mesh_basic_builder/Basic.attribInFragmentOnly.frag.glsl';
import {BaseBuilderMatNodeType} from '../../../../src/engine/nodes/mat/_BaseBuilder';

const TEST_SHADER_LIB = {
	default: {vert: BasicDefaultVertex, frag: BasicDefaultFragment},
	minimal: {vert: BasicMinimalVertex, frag: BasicMinimalFragment},
	position: {vert: BasicPositionVertex, frag: BasicPositionFragment},
	positionXZ: {vert: BasicPositionXZVertex, frag: BasicPositionXZFragment},
	attribInVertex: {vert: BasicAttribInVertexVertex, frag: BasicAttribInVertexFragment},
	attribInFragment: {vert: BasicAttribInFragmentVertex, frag: BasicAttribInFragmentFragment},
	attribInFragmentOnly: {vert: BasicAttribInFragmentOnlyVertex, frag: BasicAttribInFragmentOnlyFragment},
};

const BASIC_UNIFORMS = UniformsUtils.clone(ShaderLib.basic.uniforms);

QUnit.test('mesh basic builder simple', async (assert) => {
	const MAT = window.MAT;
	// const debug = MAT.create_node('test')
	const mesh_basic1 = MAT.create_node('mesh_basic_builder');
	const material = mesh_basic1.material;
	const globals1: GlobalsGlNode = mesh_basic1.node('globals1')! as GlobalsGlNode;
	const output1: OutputGlNode = mesh_basic1.node('output1')! as OutputGlNode;

	await mesh_basic1.request_container();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.default.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.default.frag);
	assert.deepEqual(Object.keys(material.uniforms).sort(), Object.keys(BASIC_UNIFORMS).sort());

	const constant1 = mesh_basic1.create_node('constant');
	constant1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.VEC3));
	constant1.p.vec3.set([1, 0, 0.5]);
	output1.set_input('color', constant1, ConstantGlNode.OUTPUT_NAME);
	// output1.p.color.set([1, 0, 0.5]);
	await mesh_basic1.request_container();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.minimal.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.minimal.frag);
	output1.set_input('color', globals1, 'position');

	await mesh_basic1.request_container();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.position.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.position.frag);

	const vec3_to_float1 = mesh_basic1.create_node('vec3_to_float');
	const float_to_vec3_1 = mesh_basic1.create_node('float_to_vec3');
	float_to_vec3_1.set_input('x', vec3_to_float1, 'x');
	float_to_vec3_1.set_input('z', vec3_to_float1, 'y');
	vec3_to_float1.set_input('vec', globals1, 'position');
	output1.set_input('color', float_to_vec3_1);

	await mesh_basic1.request_container();

	assert.equal(material.lights, false);
	assert.equal(material.vertexShader, TEST_SHADER_LIB.positionXZ.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.positionXZ.frag);

	// add frame dependency
	const float_to_vec3_2 = mesh_basic1.create_node('float_to_vec3');
	float_to_vec3_2.set_input('z', globals1, 'frame');
	output1.set_input('position', float_to_vec3_2, 'vec3');
	await mesh_basic1.request_container();
	assert.deepEqual(
		Object.keys(material.uniforms).sort(),
		Object.keys(BASIC_UNIFORMS)
			.concat(['frame'])
			.sort()
	);
});

QUnit.test('mesh basic builder can save and load param configs', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const mesh_basic1 = MAT.create_node('mesh_basic_builder');

	await mesh_basic1.request_container();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), []);
	assert.notOk(mesh_basic1.assembler_controller.compile_required());

	const output1 = mesh_basic1.node('output1')! as OutputGlNode;
	const attribute1 = mesh_basic1.create_node('attribute');
	const texture1 = mesh_basic1.create_node('texture');
	const vec4_to_vector1 = mesh_basic1.create_node('vec4_to_vector');
	output1.set_input('color', vec4_to_vector1, 'vec');
	vec4_to_vector1.set_input('vec4', texture1, 'rgba');
	texture1.set_input('uv', attribute1, 'output_val');
	attribute1.p.name.set('uv');
	attribute1.p.type.set(ConnectionPointTypesAvailableForAttribute.indexOf(ConnectionPointType.VEC2));

	await CoreSleep.sleep(50);

	assert.ok(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
	await mesh_basic1.request_container();
	assert.notOk(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
	// mesh_basic1.param_names();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), ['texture_map']);
	assert.equal(mesh_basic1.p.texture_map.value, '/COP/file_uv');
	mesh_basic1.params.get('texture_map')!.set('/COP/file2');

	const data = new SceneJsonExporter(scene).data();

	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const new_mesh_basic1 = scene2.node('/MAT/mesh_basic_builder1') as BaseBuilderMatNodeType;
	await new_mesh_basic1.request_container();
	assert.notOk(new_mesh_basic1.assembler_controller.compile_required());
	assert.deepEqual(new_mesh_basic1.params.spare_names.sort(), ['texture_map']);
	assert.equal(new_mesh_basic1.params.get('texture_map')?.value, '/COP/file2');
});

QUnit.test(
	'mesh basic builder: attrib is declared accordingly and uses varying if used in fragment',
	async (assert) => {
		const MAT = window.MAT;
		const mesh_basic1 = MAT.create_node('mesh_basic_builder');
		const material = mesh_basic1.material;
		const output1 = mesh_basic1.node('output1')! as OutputGlNode;
		const attribute1 = mesh_basic1.create_node('attribute');
		attribute1.p.name.set('uv');
		attribute1.p.type.set(ConnectionPointTypesAvailableForAttribute.indexOf(ConnectionPointType.VEC2));
		const vec2_to_float1 = mesh_basic1.create_node('vec2_to_float');
		const float_to_vec31 = mesh_basic1.create_node('float_to_vec3');
		vec2_to_float1.set_input(0, attribute1);
		float_to_vec31.set_input('x', vec2_to_float1, 'x');
		float_to_vec31.set_input('z', vec2_to_float1, 'y');
		console.log('set input');
		output1.set_input('position', float_to_vec31);

		assert.ok(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
		await mesh_basic1.request_container();
		assert.notOk(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
		assert.equal(material.vertexShader, TEST_SHADER_LIB.attribInVertex.vert);
		assert.equal(material.fragmentShader, TEST_SHADER_LIB.attribInVertex.frag);

		// set uv to color, to have it declared to the fragment shader
		output1.set_input('color', float_to_vec31);
		await mesh_basic1.request_container();
		assert.equal(material.vertexShader, TEST_SHADER_LIB.attribInFragment.vert);
		assert.equal(material.fragmentShader, TEST_SHADER_LIB.attribInFragment.frag);
		// remove uv from position, to have it declared ONLY to the fragment shader
		output1.set_input('position', null);
		await mesh_basic1.request_container();
		assert.equal(material.vertexShader, TEST_SHADER_LIB.attribInFragmentOnly.vert);
		assert.equal(material.fragmentShader, TEST_SHADER_LIB.attribInFragmentOnly.frag);
		return;
	}
);

QUnit.skip('mesh basic builder frame dependent', (assert) => {});

QUnit.skip('mesh basic builder bbox dependent', (assert) => {});

QUnit.skip('mesh basic builder basic instanced works without an input node', (assert) => {});
