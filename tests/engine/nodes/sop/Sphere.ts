QUnit.test('sphere simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);

	const sphere1 = geo1.createNode('sphere');

	let container = await sphere1.requestContainer();
	let core_group = container.coreContent()!;
	let geometry = core_group.geometries()[0];

	assert.ok(geometry, 'geo');
	assert.equal(container.pointsCount(), 961);

	assert.notOk(sphere1.is_dirty, 'sphere is not dirty');
	sphere1.p.resolution.set([50, 50]);
	assert.ok(sphere1.is_dirty, 'sphere is dirty');

	container = await sphere1.requestContainer();
	assert.notOk(sphere1.is_dirty, 'sphere is not dirty');
	core_group = container.coreContent()!;
	geometry = core_group.geometries()[0];

	assert.ok(geometry);
	assert.equal(container.pointsCount(), 2601);
});
