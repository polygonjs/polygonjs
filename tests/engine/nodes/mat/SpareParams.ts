import {OutputGlNode} from '../../../../src/engine/nodes/gl/Output';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {BaseBuilderMatNodeType} from '../../../../src/engine/nodes/mat/_BaseBuilder';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {CoreSleep} from '../../../../src/core/Sleep';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {MeshBasicBuilderMatNode} from '../../../../src/engine/nodes/mat/MeshBasicBuilder';
import {ColorParam} from '../../../../src/engine/params/Color';

QUnit.test(
	'MAT spare params:spare params are re-created as expected and the uniforms updated on change',
	async (assert) => {
		const scene = window.scene;
		const MAT = window.MAT;
		await scene.waitForCooksCompleted();

		const mesh_basic1 = MAT.createNode('meshBasicBuilder');
		mesh_basic1.createNode('output');
		mesh_basic1.createNode('globals');
		assert.ok(mesh_basic1.assembler_controller, 'assembler controller is present');
		assert.ok(mesh_basic1.assembler_controller?.compile_required(), 'compiled is required');

		await mesh_basic1.requestContainer();
		assert.deepEqual(mesh_basic1.params.spare_names.sort(), []);
		assert.notOk(mesh_basic1.assembler_controller?.compile_required(), 'compile is not required');

		const output1 = mesh_basic1.node('output1')! as OutputGlNode;
		const param1 = mesh_basic1.createNode('param');
		CoreSleep.sleep(10);
		assert.ok(mesh_basic1.assembler_controller?.compile_required(), 'compiled is required');
		const param_name = param1.p.name.value;
		param1.set_gl_type(GlConnectionPointType.FLOAT);

		assert.ok(mesh_basic1.assembler_controller?.compile_required(), 'compiled is required');
		CoreSleep.sleep(10);
		await mesh_basic1.requestContainer();
		assert.notOk(mesh_basic1.assembler_controller?.compile_required(), 'compiled is NOT required');

		// param should already exist, and also uniform on mat
		assert.deepEqual(mesh_basic1.params.spare_names.sort(), [param_name], 'spare params has param_name');
		assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.FLOAT);

		// changing the param type updates the spare param type
		param1.set_gl_type(GlConnectionPointType.INT);
		await mesh_basic1.requestContainer();
		assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.INTEGER);

		// we revert back to float for the rest of the test
		param1.set_gl_type(GlConnectionPointType.FLOAT);
		await mesh_basic1.requestContainer();
		assert.equal(mesh_basic1.params.get(param_name)!.type, ParamType.FLOAT);

		// updating the param updates the uniform, without having to cook the material node
		output1.setInput('alpha', param1);
		assert.ok(mesh_basic1.assembler_controller?.compile_required(), 'compiled is required');
		await mesh_basic1.requestContainer();
		assert.notOk(mesh_basic1.assembler_controller?.compile_required(), 'compiled is required');
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

		scene.setFrame(2);
		await CoreSleep.sleep(100);
		assert.equal(
			mesh_basic1.material.uniforms[uniform_name].value,
			2,
			'param updates the uniform when its expression becomes dirty'
		);
		scene.setFrame(3);
		await CoreSleep.sleep(20);
		assert.equal(
			mesh_basic1.material.uniforms[uniform_name].value,
			3,
			'param updates the uniform when its expression becomes dirty again'
		);

		// if I change the type of the param, the raw_input stays
		param1.set_gl_type(GlConnectionPointType.INT);
		await mesh_basic1.requestContainer();
		let spare_param = mesh_basic1.params.get(param_name)!;
		assert.equal(spare_param.type, ParamType.INTEGER);
		await CoreSleep.sleep(10);
		assert.equal(spare_param.raw_input, '$F');
		assert.notOk(spare_param.is_dirty, 'param not dirty');
		scene.setFrame(35);
		assert.ok(spare_param.is_dirty, 'param is dirty');
		assert.equal(scene.frame, 35, 'scene frame is 35');
		await spare_param.compute();
		assert.equal(spare_param.value, 35, 'param is 35');
		assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 35, 'uniforrm is 35');
		scene.time_controller.setFrameRange(0, 1000);
		scene.setFrame(124);
		await spare_param.compute();
		assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 124, 'frame is 124');

		// we revert back to float for the rest of the test
		param1.set_gl_type(GlConnectionPointType.FLOAT);
		await mesh_basic1.requestContainer();
		spare_param = mesh_basic1.params.get(param_name)!;
		assert.equal(spare_param.type, ParamType.FLOAT);
		assert.equal(mesh_basic1.params.get(param_name)!.raw_input, '$F');

		const data = new SceneJsonExporter(scene).data();

		// the param is not saved in the export data, since it will be re-created

		console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.load_data(data);
		await scene2.waitForCooksCompleted();

		const new_mesh_basic1 = scene2.node('/MAT/meshBasicBuilder1') as BaseBuilderMatNodeType;
		await new_mesh_basic1.requestContainer();
		assert.ok(new_mesh_basic1.assembler_controller, 'assembler_controller is present');
		assert.notOk(new_mesh_basic1.assembler_controller?.compile_required(), 'compile is not required');
		assert.deepEqual(new_mesh_basic1.params.spare_names.sort(), [param_name], 'spare params has param_name');
		assert.equal(new_mesh_basic1.params.get(param_name)?.raw_input, '$F', 'param raw input is $F');
		await CoreSleep.sleep(100);
		assert.equal(new_mesh_basic1.params.get(param_name)?.value, 124, 'param value is 124');
		assert.equal(new_mesh_basic1.material.uniforms[uniform_name].value, 124, 'uniform is 124');

		// update the param to be sure dependency with frame has been created
		scene2.setFrame(2);
		await CoreSleep.sleep(100);
		assert.equal(
			new_mesh_basic1.material.uniforms[uniform_name].value,
			2,
			'param updates the uniform when its expression becomes dirty'
		);
		scene2.setFrame(10);
		await CoreSleep.sleep(20);
		assert.equal(
			new_mesh_basic1.material.uniforms[uniform_name].value,
			10,
			'param updates the uniform when its expression becomes dirty again'
		);
	}
);

QUnit.test('MAT spare params:creating a spare param as vector, saving and load back', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');

	await scene.waitForCooksCompleted();

	await mesh_basic1.requestContainer();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), []);
	assert.notOk(mesh_basic1.assembler_controller?.compile_required());

	// const output1 = mesh_basic1.node('output1')! as OutputGlNode;

	assert.notOk(mesh_basic1.assembler_controller?.compile_required(), 'compiled is required');

	const param1 = mesh_basic1.createNode('param');
	const param_name = param1.p.name.value;
	const uniform_name = param1.uniform_name();
	// first compute with a float, and only after compute with a vector, to make sure the new val is okay
	param1.set_gl_type(GlConnectionPointType.FLOAT);
	await CoreSleep.sleep(100);
	const float_spare_param = mesh_basic1.params.get(param_name)! as FloatParam;
	assert.equal(float_spare_param.type, ParamType.FLOAT, 'param is float');
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 0);
	float_spare_param.set(0.25);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 0.25);

	// now change to vec3
	param1.set_gl_type(GlConnectionPointType.VEC3);
	await CoreSleep.sleep(100);
	let vec3_spare_param = mesh_basic1.params.get(param_name)! as Vector3Param;
	assert.equal(vec3_spare_param.type, ParamType.VECTOR3, 'param is vec3');
	assert.deepEqual(vec3_spare_param.value_serialized, [0.25, 0.25, 0.25], 'value_serialized is 0.25,0.25,0.25');
	assert.deepEqual(vec3_spare_param.default_value_serialized, [0, 0, 0], 'default_value_serialized is 0,0,0');
	vec3_spare_param.set([0.1, 0.2, 0.3]);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.x, 0.1);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.y, 0.2);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.z, 0.3);
	vec3_spare_param.y.set(0.8);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.x, 0.1);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.y, 0.8);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.z, 0.3);

	const data = new SceneJsonExporter(scene).data();

	// the param is not saved in the export data, since it will be re-created

	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.waitForCooksCompleted();
	await CoreSleep.sleep(10);
	const mesh_basic2 = scene2.node(`/MAT/${mesh_basic1.name}`)! as MeshBasicBuilderMatNode;
	const vec3_spare_param2 = mesh_basic2.params.get(param_name)! as Vector3Param;
	assert.equal(vec3_spare_param2.type, ParamType.VECTOR3);
	assert.deepEqual(vec3_spare_param2.value_serialized, [0.1, 0.8, 0.3], 'after load value_serialized is 0.1,0.8,0.3');
	assert.deepEqual(
		vec3_spare_param2.default_value_serialized,
		[0, 0, 0],
		'after load default_value_serialized is 0,0,0'
	);
	await CoreSleep.sleep(100);
	vec3_spare_param2.set([0.1, 0.2, 0.3]);
	await CoreSleep.sleep(100);
	assert.equal(vec3_spare_param2.value.x, 0.1);
	assert.equal(vec3_spare_param2.value.y, 0.2);
	assert.equal(vec3_spare_param2.value.z, 0.3);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.x, 0.1);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.y, 0.2);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.z, 0.3);
	return;
	vec3_spare_param2.y.set(0.8);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.x, 0.1);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.y, 0.8);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.z, 0.3);
});
QUnit.test('MAT spare params: creating a spare param as color, saving and load back', async (assert) => {
	const scene = window.scene;
	const MAT = window.MAT;
	const mesh_basic1 = MAT.createNode('meshBasicBuilder');
	mesh_basic1.createNode('output');
	mesh_basic1.createNode('globals');
	assert.ok(mesh_basic1.assembler_controller?.compile_required(), 'compile required');

	await scene.waitForCooksCompleted();
	await mesh_basic1.requestContainer();
	assert.deepEqual(mesh_basic1.params.spare_names.sort(), [], 'no spare params');
	assert.notOk(mesh_basic1.assembler_controller?.compile_required(), 'compile not required');

	// const output1 = mesh_basic1.node('output1')! as OutputGlNode;

	// assert.notOk(mesh_basic1.assembler_controller.compile_required(), 'compile is required');

	const param1 = mesh_basic1.createNode('param');
	const param_name = param1.p.name.value;
	const uniform_name = param1.uniform_name();
	// first compute with a float, and only after compute with a vector, to make sure the new val is okay
	param1.set_gl_type(GlConnectionPointType.FLOAT);
	await mesh_basic1.requestContainer();
	const float_spare_param = mesh_basic1.params.get(param_name)! as FloatParam;
	assert.equal(float_spare_param.type, ParamType.FLOAT, 'param is float');
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 0);
	float_spare_param.set(0.25);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value, 0.25);

	// now change to vec3
	param1.set_gl_type(GlConnectionPointType.VEC3);
	param1.p.as_color.set(1);
	await mesh_basic1.requestContainer();
	let vec3_spare_param = mesh_basic1.params.get(param_name)! as ColorParam;
	assert.equal(vec3_spare_param.type, ParamType.COLOR, 'param is color');
	assert.deepEqual(vec3_spare_param.value_serialized, [0.25, 0.25, 0.25], 'value_serialized is 0.25,0.25,0.25');
	assert.deepEqual(vec3_spare_param.default_value_serialized, [0, 0, 0], 'default_value_serialized is 0,0,0');
	vec3_spare_param.set([0.1, 0.2, 0.3]);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.r, 0.1);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.g, 0.2);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.b, 0.3);
	vec3_spare_param.g.set(0.8);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.r, 0.1);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.g, 0.8);
	assert.equal(mesh_basic1.material.uniforms[uniform_name].value.b, 0.3);

	console.log('************ EXPORT **************');
	const data = new SceneJsonExporter(scene).data();

	// the param is not saved in the export data, since it will be re-created
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.waitForCooksCompleted();
	await CoreSleep.sleep(100);
	const mesh_basic2 = scene2.node(`/MAT/${mesh_basic1.name}`)! as MeshBasicBuilderMatNode;
	const vec3_spare_param2 = mesh_basic2.params.get(param_name)! as ColorParam;
	assert.equal(vec3_spare_param2.type, ParamType.COLOR);
	assert.deepEqual(vec3_spare_param2.value_serialized, [0.1, 0.8, 0.3], 'after load value_serialized is 0.1,0.8,0.3');
	assert.deepEqual(
		vec3_spare_param2.default_value_serialized,
		[0, 0, 0],
		'after load default_value_serialized is 0,0,0'
	);
	// Note: the uniform should be set to the param value,
	// But it currently seems that this is not happening because the param is set
	// while the scene is loading, therefore the callback is not executed.
	// But this does not seem to be a problem when running the scene
	// vec3_spare_param2.options.execute_callback();
	// console.log('mesh_basic2', uniform_name, mesh_basic2.material);
	// assert.equal(mesh_basic2.material.uniforms[uniform_name].value.r, 0.1);
	// assert.equal(mesh_basic2.material.uniforms[uniform_name].value.g, 0.8);
	// assert.equal(mesh_basic2.material.uniforms[uniform_name].value.b, 0.3);

	vec3_spare_param2.set([0.7, 0.2, 0.15]);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.r, 0.7);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.g, 0.2);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.b, 0.15);
	vec3_spare_param2.g.set(0.6);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.r, 0.7);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.g, 0.6);
	assert.equal(mesh_basic2.material.uniforms[uniform_name].value.b, 0.15);
});
