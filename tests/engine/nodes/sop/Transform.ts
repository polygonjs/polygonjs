QUnit.test('transform simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);

	let container, core_group;
	container = await transform1.requestContainer();
	core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.ok(geometry);

	assert.equal(container.pointsCount(), 24);
	assert.equal(container.boundingBox().min.y, -0.5);

	assert.notOk(transform1.isDirty(), 'transform is not dirty');
	assert.notOk(transform1.p.t.isDirty(), 'transform t is not dirty');
	assert.notOk(transform1.p.t.y.isDirty(), 'transform ty is not dirty');
	transform1.p.t.y.set(2);
	assert.ok(transform1.isDirty(), 'transform is dirty');
	assert.ok(transform1.p.t.isDirty(), 'transform t is dirty');
	assert.notOk(transform1.p.t.y.isDirty(), 'transform ty is not dirty');
	container = await transform1.requestContainer();
	assert.equal(container.boundingBox().min.y, +1.5);
	assert.equal(container.boundingBox().max.y, +2.5);
	assert.notOk(transform1.isDirty());
	assert.notOk(transform1.p.t.isDirty());
	assert.notOk(transform1.p.t.y.isDirty());

	transform1.p.s.y.set(2);

	// no change for now
	assert.equal(container.boundingBox().min.y, +1.5);
	assert.equal(container.boundingBox().max.y, +2.5);

	container = await transform1.requestContainer();
	assert.equal(container.boundingBox().min.y, +1);
	assert.equal(container.boundingBox().max.y, +3);
});
