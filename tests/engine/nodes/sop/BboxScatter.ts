QUnit.test('bbox_scatter simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const bbox_scatter1 = geo1.create_node('bbox_scatter');

	bbox_scatter1.set_input(0, box1);

	let container;
	container = await bbox_scatter1.request_container();
	assert.equal(container.points_count(), 1000);

	bbox_scatter1.p.step_size.set(0.5);
	container = await bbox_scatter1.request_container();
	assert.equal(container.points_count(), 8);
});
