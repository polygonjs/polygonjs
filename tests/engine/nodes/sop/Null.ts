QUnit.test('null simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const null1 = geo1.create_node('null');

	null1.set_input(0, plane1);

	let container;

	container = await null1.request_container();
	assert.equal(container.points_count(), 4);
});
