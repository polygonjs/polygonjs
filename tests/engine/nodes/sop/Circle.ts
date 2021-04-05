QUnit.test('circle simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const circle1 = geo1.createNode('circle');
	circle1.p.open.set(0);

	let container;
	container = await circle1.compute();
	let core_group = container.coreContent()!;
	let geometry = core_group.objectsWithGeo()[0].geometry;

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 14);
	assert.equal(container.boundingBox().min.x, -1);

	scene.batchUpdates(() => {
		circle1.p.radius.set(2);
		circle1.p.segments.set(50);
	});

	container = await circle1.compute();
	core_group = container.coreContent()!;
	geometry = core_group.objectsWithGeo()[0].geometry;
	assert.ok(geometry);
	assert.equal(container.pointsCount(), 52);
	assert.in_delta(container.boundingBox().min.x, -2.0, 0.01);
});
