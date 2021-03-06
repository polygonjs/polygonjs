import {ParamType} from '../../../src/engine/poly/ParamType';

QUnit.test('expression ch refers to a node that is later added', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	const param = transform1.p.t.x;
	param.set("ch('../transform2/tx')");

	await transform1.compute();
	await param.compute();
	assert.equal(param.value, 0);
	assert.ok(param.states.error.active());
	assert.equal(
		param.states.error.message(),
		"expression returns an invalid type (undefined) (ch('../transform2/tx'))"
	);
	assert.ok(param.isDirty());

	const transform2 = geo1.createNode('transform');
	assert.equal(transform2.name(), 'transform2');
	assert.ok(param.isDirty(), 'param is now dirty');
	transform2.p.t.x.set(5);
	await param.compute();
	assert.equal(param.value, 5);
	assert.ok(!param.isDirty(), 'param is not dirty anymore');
});

QUnit.test('expression point refers to a node that is later added', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	const param = transform1.p.t.x;
	param.set("0.1*point('../data1', 'value', 0)");

	await transform1.compute();
	await param.compute();
	assert.equal(param.value, 0);
	assert.ok(param.states.error.active());
	assert.equal(
		param.states.error.message(),
		"expression error: \"0.1*point('../data1', 'value', 0)\" (invalid input (../data1))"
	);
	assert.ok(param.isDirty());

	const data = geo1.createNode('data');
	assert.equal(data.name(), 'data1');
	assert.ok(param.isDirty(), 'param is now dirty');
	await param.compute();
	assert.equal(param.value, -4);
	assert.ok(!param.isDirty(), 'param is not dirty anymore');
});

QUnit.test('a node referenced in an expression gets renamed involves updating the expression', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	const transform2 = geo1.createNode('transform');
	assert.equal(transform2.name(), 'transform2');

	transform1.p.t.x.set("ch('../transform2/tx')");
	await transform1.compute();

	assert.includes(transform1.p.t.x.graphPredecessors(), transform2.p.t.x);

	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform2/tx')");
	transform2.setName('transform_RENAMED_TO TEST');
	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform_RENAMED_TO_TEST/tx')");

	transform2.setName('transform_MASTER');
	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform_MASTER/tx')");

	transform2.setName('transform_MASTER2');
	assert.equal(transform1.p.t.x.rawInput(), "ch('../transform_MASTER2/tx')");
});

QUnit.test('a top node referenced in an expression gets renamed involves updating the expression', async (assert) => {
	const scene = window.scene;
	const root = scene.root();
	const geo1 = window.geo1;

	const camera = root.createNode('perspectiveCamera');
	camera.p.t.x.set(1);

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	const param = transform1.p.t.x;
	param.set(`ch('/${camera.name()}/tx')`);

	await param.compute();
	assert.equal(param.value, 1);

	camera.p.t.x.set(2);
	await param.compute();
	assert.equal(param.value, 2);

	camera.setName('new_camera');
	assert.equal(param.rawInput(), "ch('/new_camera/tx')");
	await param.compute();
	assert.equal(param.value, 2);

	camera.p.t.x.set(3);
	await param.compute();
	assert.equal(param.value, 3);
});

QUnit.test('a relative path in a operator path param gets updated when ref changes name', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;
	const material_sop = geo1.createNode('material');
	const material = MAT.createNode('meshBasic');
	const path_param = material_sop.p.material;
	path_param.set(material.path());

	await path_param.compute();
	assert.equal(path_param.value.path(), '/MAT/meshBasic1');

	material.setName('new_name');
	await path_param.compute();
	assert.equal(path_param.value.path(), '/MAT/new_name');

	MAT.setName('new_MAT');
	await path_param.compute();
	assert.equal(path_param.value.path(), '/new_MAT/new_name');

	material.setName('new_name_again');
	await path_param.compute();
	assert.equal(path_param.value.path(), '/new_MAT/new_name_again');
});

QUnit.test('an absolute path in a operator path param gets updated when ref changes name', async (assert) => {
	const scene = window.scene;
	const geo = window.geo1;
	const anim = scene.root().createNode('animationsNetwork');
	const target = anim.createNode('target');
	const box = geo.createNode('box');
	const param = target.p.nodePath;

	assert.equal(param.type(), ParamType.OPERATOR_PATH);

	await scene.waitForCooksCompleted();

	param.set(box.path());

	await param.compute();
	assert.equal(param.value, '/geo1/box1');

	box.setName('new_name');
	// assert.ok(param.isDirty(), 'is dirty on renamed 1');
	// await param.compute();
	// assert.notOk(param.isDirty());
	assert.equal(param.value, '/geo1/new_name');

	box.setName('new_name2');
	// assert.ok(param.isDirty(), 'is dirty on renamed 2');
	// await param.compute();
	// assert.notOk(param.isDirty());
	assert.equal(param.value, '/geo1/new_name2');

	geo.setName('new_event');
	// assert.ok(param.isDirty());
	// await param.compute();
	// assert.notOk(param.isDirty());
	assert.equal(param.value, '/new_event/new_name2');

	box.setName('new_name_again');
	// assert.ok(param.isDirty());
	// await param.compute();
	// assert.notOk(param.isDirty());
	assert.equal(param.value, '/new_event/new_name_again');
});

QUnit.test('an absolute path in a node path param gets updated when ref changes name', async (assert) => {
	const scene = window.scene;
	const root = scene.root();
	const event = root.createNode('eventsNetwork');
	const orbit = event.createNode('cameraOrbitControls');
	const camera = root.createNode('perspectiveCamera');
	const controls_param = camera.p.controls;
	assert.equal(controls_param.type(), ParamType.NODE_PATH);

	await scene.waitForCooksCompleted();

	controls_param.set(orbit.path());

	await controls_param.compute();
	assert.equal(controls_param.value.path(), '/eventsNetwork1/cameraOrbitControls1');

	orbit.setName('new_name');
	assert.ok(controls_param.isDirty(), 'is dirty on renamed 1');
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/eventsNetwork1/new_name');

	orbit.setName('new_name2');
	assert.ok(controls_param.isDirty(), 'is dirty on renamed 2');
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/eventsNetwork1/new_name2');

	event.setName('new_event');
	assert.ok(controls_param.isDirty());
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/new_event/new_name2');

	orbit.setName('new_name_again');
	assert.ok(controls_param.isDirty());
	await controls_param.compute();
	assert.notOk(controls_param.isDirty());
	assert.equal(controls_param.value.path(), '/new_event/new_name_again');
});

QUnit.test(
	'an operator path param referencing a param gets updated when the param is deleted or added',
	async (assert) => {
		const scene = window.scene;
		const root = scene.root();
		const MAT = window.MAT;
		const event = root.createNode('eventsNetwork');
		const set_param1 = event.createNode('setParam');
		const param_operator_path_param = set_param1.p.param;
		const mesh_basic_builder1 = MAT.createNode('meshBasicBuilder');
		mesh_basic_builder1.createNode('output');
		mesh_basic_builder1.createNode('globals');

		await scene.waitForCooksCompleted();

		param_operator_path_param.set(`${mesh_basic_builder1.path()}/test_param`);
		await param_operator_path_param.compute();
		assert.notOk(param_operator_path_param.value.param());

		const init_params_count = mesh_basic_builder1.params.all.length;
		assert.equal(init_params_count, 37);
		const param1 = mesh_basic_builder1.createNode('param');
		await mesh_basic_builder1.compute();
		assert.equal(mesh_basic_builder1.params.all.length, 38);
		assert.equal(mesh_basic_builder1.params.all[37].name(), 'param1');
		assert.notOk(param_operator_path_param.value.param());

		param1.p.name.set('test_param');
		await mesh_basic_builder1.compute();
		assert.equal(mesh_basic_builder1.params.all[37].name(), 'test_param', 'last param is called test_param');
		assert.ok(param_operator_path_param.value.param(), 'a param is found');
		assert.equal(
			param_operator_path_param.value.param()!.graphNodeId(),
			mesh_basic_builder1.params.get('test_param')!.graphNodeId(),
			'the found param is test_param'
		);
	}
);
