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
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {VolumeBuilderMatNode} from '../../../../src/engine/nodes/mat/VolumeBuilder';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {AssemblersUtils} from '../../../helpers/AssemblersUtils';

const TEST_SHADER_LIB = {
	default: {vert: BasicDefaultVertex, frag: BasicDefaultFragment},
	minimal: {vert: BasicMinimalVertex, frag: BasicMinimalFragment},
	position: {vert: BasicPositionVertex, frag: BasicPositionFragment},
};

QUnit.test('volume builder simple', async (assert) => {
	const MAT = window.MAT;
	// const debug = MAT.createNode('test')
	const volume_builder1 = MAT.createNode('volumeBuilder');
	volume_builder1.createNode('output');
	volume_builder1.createNode('globals');
	const material = volume_builder1.material;
	const globals1: GlobalsGlNode = volume_builder1.node('globals1')! as GlobalsGlNode;
	const output1: OutputGlNode = volume_builder1.node('output1')! as OutputGlNode;

	await volume_builder1.requestContainer();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.default.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.default.frag);
	assert.deepEqual(Object.keys(material.uniforms).sort(), Object.keys(VOLUME_UNIFORMS).sort());

	const constant1 = volume_builder1.createNode('constant');
	constant1.set_gl_type(GlConnectionPointType.FLOAT);
	constant1.p.vec3.set([1, 0, 0.5]);
	output1.setInput('density', constant1, ConstantGlNode.OUTPUT_NAME);
	// output1.p.color.set([1, 0, 0.5]);
	await volume_builder1.requestContainer();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.minimal.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.minimal.frag);

	const vec3ToFloat1 = volume_builder1.createNode('vec3ToFloat');
	output1.setInput('density', vec3ToFloat1, 'y');
	vec3ToFloat1.setInput(0, globals1, 'position');

	await volume_builder1.requestContainer();
	assert.equal(material.vertexShader, TEST_SHADER_LIB.position.vert);
	assert.equal(material.fragmentShader, TEST_SHADER_LIB.position.frag);
});

QUnit.test('volume builder persisted_config', async (assert) => {
	const MAT = window.MAT;
	const volume1 = MAT.createNode('volumeBuilder');
	volume1.createNode('output');
	volume1.createNode('globals');
	const output1 = volume1.nodesByType('output')[0];
	const globals1 = volume1.nodesByType('globals')[0];
	const param1 = volume1.createNode('param');
	param1.p.name.set('float_param');
	const param2 = volume1.createNode('param');
	param2.set_gl_type(GlConnectionPointType.VEC3);
	param2.p.name.set('vec3_param');
	const float_to_vec31 = volume1.createNode('floatToVec3');
	float_to_vec31.setInput(0, param1);
	float_to_vec31.setInput(1, globals1, 'time');
	output1.setInput(0, param2);
	await volume1.requestContainer();

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	await AssemblersUtils.with_unregistered_assembler(volume1.used_assembler(), async () => {
		console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.load_data(data);
		await scene2.wait_for_cooks_completed();

		const new_volume1 = scene2.node('/MAT/volumeBuilder1') as VolumeBuilderMatNode;
		assert.notOk(new_volume1.assembler_controller);
		assert.ok(new_volume1.persisted_config);
		const float_param = new_volume1.params.get('float_param') as FloatParam;
		const vec3_param = new_volume1.params.get('vec3_param') as Vector3Param;
		assert.ok(float_param);
		assert.ok(vec3_param);
		const material = new_volume1.material;
		assert.equal(material.fragmentShader, volume1.material.fragmentShader);
		assert.equal(material.vertexShader, volume1.material.vertexShader);

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
