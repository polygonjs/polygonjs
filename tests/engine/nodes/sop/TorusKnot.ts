QUnit.test('torus knot simple', async (assert) => {
	const geo1 = window.geo1;

	const torus_knot1 = geo1.create_node('torus_knot');

	let container = await torus_knot1.request_container();
	const core_group = container.core_content()!;
	const {geometry} = core_group.objects_with_geo()[0];

	assert.ok(geometry);
	assert.equal(container.points_count(), 585);
});
