import {CoreSleep} from '../../../../src/core/Sleep';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RampParam} from '../../../../src/engine/params/Ramp';
import {OperatorPathParam} from '../../../../src/engine/params/OperatorPath';
import {FloatParam} from '../../../../src/engine/params/Float';
import {SceneJsonImporter} from '../../../../src/engine';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {FileCopNode} from '../../../../src/engine/nodes/cop/File';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';

QUnit.test('MAT spare params: ensures uniforms are set when scene loads', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const COP = window.COP;
	const file1 = COP.create_node('file');
	const cop_file_name = 'file_uv';
	file1.set_name(cop_file_name);
	const container = await file1.request_container();
	const file1_texture = container.texture();
	await scene.wait_for_cooks_completed();

	const mesh_basic1 = MAT.create_node('mesh_basic_builder');
	const output1 = mesh_basic1.nodes_by_type('output')[0];
	const globals1 = mesh_basic1.nodes_by_type('globals')[0];
	const float_to_vec31 = mesh_basic1.create_node('float_to_vec3');
	const vec3_to_float1 = mesh_basic1.create_node('vec3_to_float');
	const vec4_to_float1 = mesh_basic1.create_node('vec4_to_float');
	const param1 = mesh_basic1.create_node('param');
	const ramp1 = mesh_basic1.create_node('ramp');
	const texture1 = mesh_basic1.create_node('texture');
	texture1.p.default_value.set(file1.full_path());

	output1.set_input('color', float_to_vec31);
	// ramp
	float_to_vec31.set_input(0, ramp1);
	ramp1.set_input(0, vec3_to_float1);
	vec3_to_float1.set_input(0, globals1, 'position');
	// texture
	float_to_vec31.set_input(1, vec4_to_float1, 0);
	vec4_to_float1.set_input(0, texture1);
	texture1.set_input(0, globals1, 'uv');
	// param
	float_to_vec31.set_input(2, param1, 0);

	await mesh_basic1.request_container();
	CoreSleep.sleep(100);
	assert.equal(mesh_basic1.params.spare.length, 3);
	const ramp_spare_param1 = mesh_basic1.params.get('ramp') as RampParam;
	const operator_path_spare_param1 = mesh_basic1.params.get('texture_map') as OperatorPathParam;
	const float_spare_param1 = mesh_basic1.params.get('param1') as FloatParam;
	float_spare_param1.set(0.75);
	await CoreSleep.sleep(300); // delay should be longer than the delay in SpareParamsController for operator_path params

	// check that the spare params are presetn
	assert.ok(ramp_spare_param1);
	assert.ok(operator_path_spare_param1);
	assert.ok(float_spare_param1);
	// check that the spare paramsare the expected type
	assert.equal(ramp_spare_param1.type, ParamType.RAMP);
	assert.equal(operator_path_spare_param1.type, ParamType.OPERATOR_PATH);
	assert.equal(float_spare_param1.type, ParamType.FLOAT);
	// check that the uniforms are present
	assert.ok(mesh_basic1.material.uniforms['ramp_texture_v_POLY_ramp1_val']);
	assert.ok(mesh_basic1.material.uniforms['v_POLY_texture1_texture_map']);
	assert.ok(mesh_basic1.material.uniforms['v_POLY_param1_val']);

	assert.equal(
		mesh_basic1.material.uniforms['ramp_texture_v_POLY_ramp1_val'].value.uuid,
		ramp_spare_param1.ramp_texture().uuid
	);
	assert.equal(mesh_basic1.material.uniforms['v_POLY_texture1_texture_map'].value.uuid, file1_texture.uuid);
	assert.equal(mesh_basic1.material.uniforms['v_POLY_param1_val'].value, 0.75);

	// and now we save and reload

	const data = new SceneJsonExporter(scene).data();

	// the param is not saved in the export data, since it will be re-created

	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();
	await CoreSleep.sleep(500);

	const file2 = scene2.node(file1.full_path()) as FileCopNode;
	const container2 = await file2.request_container();
	const file2_texture = container2.texture();
	const mesh_basic2 = scene2.node(mesh_basic1.full_path()) as MeshBasicBuilderMatNode;
	assert.equal(mesh_basic2.params.spare.length, 3);
	const ramp_spare_param2 = mesh_basic2.params.get('ramp') as RampParam;
	// const operator_path_spare_param2 = mesh_basic2.params.get('texture_map') as OperatorPathParam;
	// const float_spare_param2 = mesh_basic2.params.get('param1') as FloatParam;

	assert.equal(
		mesh_basic2.material.uniforms['ramp_texture_v_POLY_ramp1_val'].value.uuid,
		ramp_spare_param2.ramp_texture().uuid
	);
	assert.equal(mesh_basic2.material.uniforms['v_POLY_texture1_texture_map'].value.uuid, file2_texture.uuid);
	assert.equal(mesh_basic2.material.uniforms['v_POLY_param1_val'].value, 0.75);
});
