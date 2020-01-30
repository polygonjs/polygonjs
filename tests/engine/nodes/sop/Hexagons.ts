QUnit.test('hexagons simple', async (assert) => {
	const geo1 = window.geo1;

	const hexagons1 = geo1.create_node('hexagons');

	let container;

	container = await hexagons1.request_container();
	assert.equal(container.points_count(), 110);
});
