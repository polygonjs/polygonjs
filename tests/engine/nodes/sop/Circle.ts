QUnit.test('circle simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const circle1 = geo1.create_node('circle');
	circle1.p.open.set(0);

	let container;
	container = await circle1.request_container();
	let core_group = container.core_content()!;
	let geometry = core_group.objects_with_geo()[0].geometry;

	assert.ok(geometry);
	assert.equal(container.points_count(), 14);
	assert.equal(container.bounding_box().min.x, -1);

	scene.batch_update(() => {
		circle1.p.radius.set(2);
		circle1.p.segments.set(50);
	});

	container = await circle1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry);
	assert.equal(container.points_count(), 52);
	assert.in_delta(container.bounding_box().min.x, -2.0, 0.01);
});
