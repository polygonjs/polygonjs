QUnit.test('circle 3 points simple', async (assert) => {
	const geo1 = window.geo1;

	const add0 = geo1.create_node('add');
	const add1 = geo1.create_node('add');
	const add2 = geo1.create_node('add');
	const merge1 = geo1.create_node('merge');
	add0.p.position.set([-1, 0, 0]);
	add2.p.position.set([1, 0, 0]);
	add1.p.position.set([0, 0, 1]);
	merge1.set_input(0, add0);
	merge1.set_input(1, add1);
	merge1.set_input(2, add2);

	const circle_3_points1 = geo1.create_node('circle3points');
	circle_3_points1.set_input(0, merge1);

	let container = await circle_3_points1.request_container();
	let core_group = container.core_content()!;
	let geometry = core_group.objects_with_geo()[0].geometry;

	assert.ok(geometry);
	assert.equal(container.points_count(), 101);
});
