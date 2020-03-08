QUnit.test('an expression refers to a node that is later added', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	transform1.set_input(0, box1);
	const param = transform1.p.t.x;
	param.set("ch('../transform2/tx')");

	await transform1.request_container();
	await param.compute();
	assert.equal(param.value, 0);

	assert.ok(!param.is_dirty);
	const transform2 = geo1.create_node('transform');
	assert.equal(transform2.name, 'transform2');
	assert.ok(param.is_dirty, 'param is now dirty');
	transform2.p.t.x.set(5);
	await param.compute();
	assert.equal(param.value, 5);
	assert.ok(!param.is_dirty, 'param is not dirty anymore');
});

QUnit.test('a node referenced in an expression gets renamed involves updating the expression', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	transform1.set_input(0, box1);

	const transform2 = geo1.create_node('transform');
	assert.equal(transform2.name, 'transform2');

	transform1.p.t.x.set("ch('../transform2/tx')");
	await transform1.request_container();

	assert.includes(transform1.p.t.x.graph_predecessors(), transform2.p.t.x);

	assert.equal(transform1.p.t.x.raw_input, "ch('../transform2/tx')");
	transform2.set_name('transform_RENAMED_TO TEST');
	assert.equal(transform1.p.t.x.raw_input, "ch('../transform_RENAMED_TO_TEST/tx')");

	transform2.set_name('transform_MASTER');
	assert.equal(transform1.p.t.x.raw_input, "ch('../transform_MASTER/tx')");

	transform2.set_name('transform_MASTER2');
	assert.equal(transform1.p.t.x.raw_input, "ch('../transform_MASTER2/tx')");
});

QUnit.test('a top node referenced in an expression gets renamed involves updating the expression', async (assert) => {
	const scene = window.scene;
	const root = scene.root;
	const geo1 = window.geo1;

	const camera = root.create_node('perspective_camera');
	camera.p.t.x.set(1);

	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	transform1.set_input(0, box1);
	const param = transform1.p.t.x;
	param.set(`ch('/${camera.name}/tx')`);

	await param.compute();
	assert.equal(param.value, 1);

	camera.p.t.x.set(2);
	await param.compute();
	assert.equal(param.value, 2);

	camera.set_name('new_camera');
	assert.equal(param.raw_input, "ch('/new_camera/tx')");
	await param.compute();
	assert.equal(param.value, 2);

	camera.p.t.x.set(3);
	await param.compute();
	assert.equal(param.value, 3);
});

QUnit.test('a relative path in a operator path param gets updated when ref changes name', async (assert) => {
	const geo1 = window.geo1;
	const MAT = window.MAT;
	const material_sop = geo1.create_node('material');
	const material = MAT.create_node('mesh_basic');
	const path_param = material_sop.p.material;
	path_param.set(material.full_path());

	await path_param.compute();
	assert.equal(path_param.value, '/MAT/mesh_basic1');

	material.set_name('new_name');
	await path_param.compute();
	assert.equal(path_param.value, '/MAT/new_name');

	MAT.set_name('new_MAT');
	await path_param.compute();
	assert.equal(path_param.value, '/new_MAT/new_name');

	material.set_name('new_name_again');
	await path_param.compute();
	assert.equal(path_param.value, '/new_MAT/new_name_again');
});

QUnit.test('an absolute path in a operator path param gets updated when ref changes name', async (assert) => {
	const scene = window.scene;
	const root = scene.root;
	const event = root.create_node('events');
	const orbit = event.create_node('camera_orbit_controls');
	const camera = root.create_node('perspective_camera');
	const controls_param = camera.p.controls;
	controls_param.set(orbit.full_path());

	let val;
	val = await controls_param.compute();
	assert.equal(val, '/events1/orbit_controls1');

	orbit.set_name('new_name');
	val = await controls_param.compute();
	assert.equal(val, '/events1/new_name');

	event.set_name('new_event');
	val = await controls_param.compute();
	assert.equal(val, '/new_event/new_name');

	orbit.set_name('new_name_again');
	val = await controls_param.compute();
	assert.equal(val, '/new_event/new_name_again');
});
