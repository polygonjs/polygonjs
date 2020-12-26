QUnit.test('transform simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	let container, core_group;
	container = await transform1.request_container();
	core_group = container.core_content();
	const geometry = core_group?.objects_with_geo()[0].geometry;
	assert.ok(geometry);

	assert.equal(container.points_count(), 24);
	assert.equal(container.bounding_box().min.y, -0.5);

	assert.notOk(transform1.is_dirty, 'transform is not dirty');
	assert.notOk(transform1.p.t.is_dirty, 'transform t is not dirty');
	assert.notOk(transform1.p.t.y.is_dirty, 'transform ty is not dirty');
	transform1.p.t.y.set(2);
	assert.ok(transform1.is_dirty, 'transform is dirty');
	assert.ok(transform1.p.t.is_dirty, 'transform t is dirty');
	assert.notOk(transform1.p.t.y.is_dirty, 'transform ty is not dirty');
	container = await transform1.request_container();
	assert.equal(container.bounding_box().min.y, +1.5);
	assert.equal(container.bounding_box().max.y, +2.5);
	assert.notOk(transform1.is_dirty);
	assert.notOk(transform1.p.t.is_dirty);
	assert.notOk(transform1.p.t.y.is_dirty);

	transform1.p.s.y.set(2);

	// no change for now
	assert.equal(container.bounding_box().min.y, +1.5);
	assert.equal(container.bounding_box().max.y, +2.5);

	container = await transform1.request_container();
	assert.equal(container.bounding_box().min.y, +1);
	assert.equal(container.bounding_box().max.y, +3);
});
