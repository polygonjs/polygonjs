QUnit.test('box simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const box1 = geo1.create_node('box');

	let container = await box1.request_container();
	const core_group = container.core_content();
	const geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 72);
	assert.equal(container.bounding_box().min.y, -0.5);
	assert.notOk(box1.is_dirty, 'box is dirty');

	box1.p.size.set(2);
	assert.ok(box1.is_dirty, 'box is dirty');
	container = await box1.request_container();
	assert.ok(!box1.is_dirty, 'box is not dirty anymore');
	assert.equal(container.bounding_box().min.y, -1.0);
});

QUnit.test('box with input', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const box1 = geo1.create_node('box');
	const transform1 = geo1.create_node('transform');
	transform1.io.inputs.set_input(0, box1);

	const box2 = geo1.create_node('box');
	assert.ok(box2.is_dirty);
	let container;
	await box2.request_container();
	assert.notOk(box2.is_dirty);
	box2.io.inputs.set_input(0, transform1);
	assert.ok(box2.is_dirty);
	await box2.request_container();
	assert.notOk(box2.is_dirty);

	transform1.p.scale.set(3);
	assert.ok(box2.is_dirty);

	container = await box2.request_container();
	const group = container.core_content()!;
	const {geometry} = group.objects()[0];

	assert.equal(geometry.getAttribute('position').array.length, 72);
	assert.equal(container.bounding_box().min.y, -1.5);
});

QUnit.test('box with expression', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	let container;
	const box1 = geo1.create_node('box');

	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -0.5);

	box1.p.size.set('1+1');
	assert.ok(box1.p.size.is_dirty, 'size is dirty');
	await box1.p.size.compute();
	assert.equal(box1.pv.size, 2);
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -1);

	box1.p.size.set('2*3');
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -3);

	box1.p.size.set('$PI');
	container = await box1.request_container();
	assert.in_delta(container.bounding_box().min.y, -1.57, 0.1);

	// with an invalid value
	assert.notOk(box1.states.error.active);
	box1.p.size.set('1+');
	await box1.p.size.compute();
	assert.ok(box1.p.size.states.error.active, 'check param is errored');

	// with $F
	scene.set_frame(5);
	box1.p.size.set('$F');
	assert.notOk(box1.states.error.active);
	await box1.p.size.compute();
	assert.equal(box1.pv.size, 5);
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -2.5);

	assert.notOk(box1.p.size.is_dirty);
	assert.notOk(box1.is_dirty);
	scene.set_frame(10);
	assert.ok(box1.p.size.is_dirty);
	assert.ok(box1.is_dirty);
	await box1.p.size.compute();
	assert.equal(box1.pv.size, 10);
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -5);

	scene.set_frame(20);
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -10);

	box1.p.size.set('$F+1');
	container = await box1.request_container();
	assert.equal(container.bounding_box().min.y, -10.5);
});
