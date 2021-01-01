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
	merge.setInput(0, add1);
	merge.setInput(1, add2);
	merge.setInput(2, add3);

	const add = geo1.createNode('add');
	add.setInput(0, merge);
	add.p.createPoint.set(false);
	add.p.connectInputPoints.set(true);

	let container = await add.request_container();
	let core_group = container.core_content()!;
	assert.equal(core_group.points().length, 3);

	add.p.connectToLastPoint.set(true);
	container = await add.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.points().length, 4);
});
