QUnit.test('add simple', async (assert) => {
	const geo1 = window.geo1;
	const add1 = geo1.createNode('add');

	const container = await add1.request_container();
	const core_group = container.core_content()!;
	assert.equal(core_group.points().length, 1);
});

QUnit.test('add connect input points', async (assert) => {
	const geo1 = window.geo1;
	const add1 = geo1.createNode('add');
	const add2 = geo1.createNode('add');
	const add3 = geo1.createNode('add');

	add1.p.position.set([0, 0, 1]);
	add2.p.position.set([0, 0, -1]);
	add3.p.position.set([0, 1, 0]);
	const merge = geo1.createNode('merge');
	merge.set_input(0, add1);
	merge.set_input(1, add2);
	merge.set_input(2, add3);

	const add = geo1.createNode('add');
	add.set_input(0, merge);
	add.p.create_point.set(false);
	add.p.connect_input_points.set(true);

	let container = await add.request_container();
	let core_group = container.core_content()!;
	assert.equal(core_group.points().length, 3);

	add.p.connect_to_last_point.set(true);
	container = await add.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.points().length, 4);
});
