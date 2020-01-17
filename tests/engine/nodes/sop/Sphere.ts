QUnit.test('sphere simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.create_node('sphere');

	let container;
	container = await sphere1.request_container();
	let core_group = container.core_content()!;
	let {geometry} = core_group.objects()[0];

	assert.ok(geometry, 'geo');
	assert.equal(container.points_count(), 63);

	// careful, setting the param twice here
	// would make the node dirty on the first 'set'
	// and the second one would not take effect.. needs checking
	// sphere1.param('resolutionx').set(50);
	// sphere1.param('resolutiony').set(50);
	sphere1.p.resolution.set([50, 50]);
	assert.ok(sphere1.is_dirty);

	container = await sphere1.request_container();
	assert.ok(!sphere1.is_dirty);
	core_group = container.core_content()!;
	({geometry} = core_group.objects()[0]);

	assert.ok(geometry);
	assert.equal(container.points_count(), 2601);
});
