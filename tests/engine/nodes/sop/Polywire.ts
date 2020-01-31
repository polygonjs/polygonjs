QUnit.test('polywire simple', async (assert) => {
	const geo1 = window.geo1;

	const circle1 = geo1.create_node('circle');
	const polywire1 = geo1.create_node('polywire');

	polywire1.set_input(0, circle1);

	let container;

	container = await circle1.request_container();
	assert.equal(container.points_count(), 12);

	container = await polywire1.request_container();
	assert.equal(container.points_count(), 192);
});
