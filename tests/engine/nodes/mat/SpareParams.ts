import {OutputGlNode} from '../../../../src/engine/nodes/gl/Output';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {BaseBuilderMatNodeType} from '../../../../src/engine/nodes/mat/_BaseBuilder';
import {
	ConnectionPointTypes,
	ConnectionPointType,
} from '../../../../src/engine/nodes/utils/connections/ConnectionPointType';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('spare params are re-created as expected and the uniforms updated on change', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const mesh_basic1 = MAT.create_node('mesh_basic_builder');

	await scene.wait_for_cooks_completed();

	await mesh_basic1.request_container();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), []);
	assert.notOk(mesh_basic1.assembler_controller.compile_required());

	const output1 = mesh_basic1.node('output1')! as OutputGlNode;

	assert.notOk(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');

	const param1 = mesh_basic1.create_node('param');
	const param_name = param1.p.name.value;
	param1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));

	assert.ok(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
	await mesh_basic1.request_container();
	assert.notOk(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');

	// param should already exist, and also uniform on mat
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), [param_name], 'spare params has param_name');
	assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.FLOAT);

	// changing the param type updates the spare param type
	param1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.INT));
	await mesh_basic1.request_container();
	assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.INTEGER);

	// we revert back to float for the rest of the test
	param1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));
	await mesh_basic1.request_container();
	assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.FLOAT);

	// updating the param updates the uniform, without having to cook the material node
	output1.set_input('alpha', param1);
	assert.ok(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
	await mesh_basic1.request_container();
	assert.notOk(mesh_basic1.assembler_controller.compile_required(), 'compiled is required');
	const uniform_name = param1.uniform_name();
	assert.equal(mesh_basic1.params.get(param_name)!.value, 0);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 0);
	mesh_basic1.params.get(param_name)!.set(0.5);
	assert.equal(
		mesh_basic1.material.uniforms[uniform_name].value,
		0.5,
		'param updates the uniform when its value changes'
	);

	// and use an expression on the param as well
	mesh_basic1.params.get(param_name)!.set('$F');
	assert.equal(scene.frame, 1);
	await CoreSleep.sleep(100);
	assert.equal(
		mesh_basic1.material.uniforms[uniform_name].value,
		1,
		'param updates the uniform when its expression becomes dirty'
	);

	scene.set_frame(2);
	await CoreSleep.sleep(100);
	assert.equal(
		mesh_basic1.material.uniforms[uniform_name].value,
		2,
		'param updates the uniform when its expression becomes dirty'
	);
	scene.set_frame(3);
	await CoreSleep.sleep(20);
	assert.equal(
		mesh_basic1.material.uniforms[uniform_name].value,
		3,
		'param updates the uniform when its expression becomes dirty again'
	);

	// if I change the type of the param, the raw_input stays
	param1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.INT));
	await mesh_basic1.request_container();
	assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.INTEGER);
	assert.equal(mesh_basic1.params.get(param_name)!.raw_input, '$F');

	// we revert back to float for the rest of the test
	param1.p.type.set(ConnectionPointTypes.indexOf(ConnectionPointType.FLOAT));
	await mesh_basic1.request_container();
	assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.FLOAT);
	assert.equal(mesh_basic1.params.get(param_name)!.raw_input, '$F');

	const data = new SceneJsonExporter(scene).data();

	// the param is not saved in the export data, since it will be re-created

	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const new_mesh_basic1 = scene2.node('/MAT/mesh_basic_builder1') as BaseBuilderMatNodeType;
	await new_mesh_basic1.request_container();
	assert.notOk(new_mesh_basic1.assembler_controller.compile_required(), 'compile is not required');
	assert.deepEqual(new_mesh_basic1.params.spare_names.sort(), [param_name], 'spare params has param_name');
	assert.equal(new_mesh_basic1.params.get(param_name)?.raw_input, '$F', 'param input is $F');
	await CoreSleep.sleep(100);
	assert.equal(new_mesh_basic1.params.get(param_name)?.value, 3, 'param value is 3');
	assert.equal(new_mesh_basic1.material.uniforms[uniform_name].value, 3, 'uniform is 3');

	// update the param to be sure dependency with frame has been created
	scene2.set_frame(2);
	await CoreSleep.sleep(100);
	assert.equal(
		new_mesh_basic1.material.uniforms[uniform_name].value,
		2,
		'param updates the uniform when its expression becomes dirty'
	);
	scene2.set_frame(10);
	await CoreSleep.sleep(20);
	assert.equal(
		new_mesh_basic1.material.uniforms[uniform_name].value,
		10,
		'param updates the uniform when its expression becomes dirty again'
	);
});
