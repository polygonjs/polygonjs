QUnit.test('sphere simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false);

	const sphere1 = geo1.create_node('sphere');

	let container = await sphere1.request_container();
	let core_group = container.core_content()!;
	let geometry = core_group.geometries()[0];

	assert.ok(geometry, 'geo');
	assert.equal(container.points_count(), 961);

	assert.notOk(sphere1.is_dirty, 'sphere is not dirty');
	sphere1.p.resolution.set([50, 50]);
	assert.ok(sphere1.is_dirty, 'sphere is dirty');

	container = await sphere1.request_container();
	assert.notOk(sphere1.is_dirty, 'sphere is not dirty');
	core_group = container.core_content()!;
	geometry = core_group.geometries()[0];

	assert.ok(geometry);
	assert.equal(container.points_count(), 2601);
});
