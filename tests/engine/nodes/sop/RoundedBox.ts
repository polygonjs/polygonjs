QUnit.test('rounded_box simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const rounded_box1 = geo1.createNode('rounded_box');

	let container = await rounded_box1.request_container();
	let core_group = container.core_content();
	let geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 2700);
	assert.equal(container.bounding_box().min.y, -0.5);
	assert.notOk(rounded_box1.is_dirty, 'box is dirty');

	rounded_box1.p.size.set(2);
	assert.ok(rounded_box1.is_dirty, 'box is dirty');
	container = await rounded_box1.request_container();
	assert.ok(!rounded_box1.is_dirty, 'box is not dirty anymore');
	assert.equal(container.bounding_box().min.y, -1.0);

	rounded_box1.p.divisions.set(10);
	container = await rounded_box1.request_container();
	core_group = container.core_content();
	geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 47628);
});

QUnit.test('rounded_box with input', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node display_node_controller

	const rounded_box1 = geo1.createNode('rounded_box');
	const transform1 = geo1.createNode('transform');
	transform1.io.inputs.set_input(0, rounded_box1);

	const rounded_box2 = geo1.createNode('rounded_box');
	assert.ok(rounded_box2.is_dirty);
	let container;
	await rounded_box2.request_container();
	assert.notOk(rounded_box2.is_dirty);
	rounded_box2.io.inputs.set_input(0, transform1);
	assert.ok(rounded_box2.is_dirty);
	await rounded_box2.request_container();
	assert.notOk(rounded_box2.is_dirty);

	transform1.p.scale.set(3);
	assert.ok(rounded_box2.is_dirty);

	container = await rounded_box2.request_container();
	const group = container.core_content()!;
	const {geometry} = group.objects_with_geo()[0];

	assert.equal(geometry.getAttribute('position').array.length, 2700);
	assert.equal(container.bounding_box().min.y, -1.5);
});
