QUnit.test('copy simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const plane1 = geo1.create_node('plane');
	const copy1 = geo1.create_node('copy');
	copy1.set_input(0, box1);
	copy1.set_input(1, plane1);
	plane1.p.direction.set([0, 0, 1]);

	let container = await copy1.request_container();
	// let core_group = container.core_content()!;
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.points_count(), 96);
	assert.equal(container.bounding_box().min.y, -1.0);

	plane1.p.use_segments_count.set(1);
	plane1.p.size.y.set(2);

	container = await copy1.request_container();
	// core_group = container.core_content()!;
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.points_count(), 96);
	assert.equal(container.bounding_box().min.y, -1.5);
});

QUnit.test('copy with template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const plane1 = geo1.create_node('plane');
	const line1 = geo1.create_node('line');
	const switch1 = geo1.create_node('switch');
	switch1.set_input(0, plane1);
	switch1.set_input(1, box1);

	const copy1 = geo1.create_node('copy');
	copy1.set_input(0, switch1);
	copy1.set_input(1, line1);

	switch1.p.input.set(`copy('../${copy1.name}', 0)`);
	assert.ok(switch1.graph_all_predecessors().includes(copy1.stamp_node));

	let container = await copy1.request_container();
	// let core_group = container.core_content();
	// let { geometry } = group.children[0];

	assert.equal(container.points_count(), 8);

	copy1.p.use_copy_expr.set(1);
	container = await copy1.request_container();
	// core_group = container.core_content();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.points_count(), 48);

	// done();
});

QUnit.skip('copy without template and stamp', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const plane1 = geo1.create_node('plane');
	const switch1 = geo1.create_node('switch');
	switch1.set_input(0, plane1);
	switch1.set_input(1, box1);

	const copy1 = geo1.create_node('copy');
	copy1.set_input(0, switch1);
	copy1.p.count.set(3);

	switch1.p.input.set("stamp('../copy1', 0) % 2");

	let container = await copy1.request_container();
	// let core_group = container.core_content();
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.points_count(), 12);

	copy1.p.stamp.set(1);
	container = await copy1.request_container();
	// core_group = container.core_content();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.points_count(), 32);
});

QUnit.skip('copy with group sets an error', (assert) => {});
