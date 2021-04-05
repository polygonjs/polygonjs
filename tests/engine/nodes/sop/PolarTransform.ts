QUnit.test('polarTransform simple', async (assert) => {
	const geo1 = window.geo1;

	const add1 = geo1.createNode('add');
	const polarTransform1 = geo1.createNode('polarTransform');
	polarTransform1.setInput(0, add1);

	let container, core_group;
	container = await polarTransform1.compute();
	core_group = container.coreContent();
	let geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.ok(geometry);

	assert.equal(container.pointsCount(), 1);
	let points = container.coreContent()!.points();
	assert.equal(points[0].position().x, 0);
	assert.equal(points[0].position().y, 0);
	assert.equal(points[0].position().z, 1);

	polarTransform1.p.latitude.set(90);

	container = await polarTransform1.compute();
	core_group = container.coreContent();
	geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.ok(geometry);

	assert.equal(container.pointsCount(), 1);
	points = container.coreContent()!.points();
	assert.equal(points[0].position().x, 0);
	assert.in_delta(points[0].position().y, 1, 0.001);
	assert.in_delta(points[0].position().z, 0, 0.001);
});
