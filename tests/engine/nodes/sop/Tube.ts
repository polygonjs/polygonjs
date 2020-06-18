QUnit.test('tube simple', async (assert) => {
	const geo1 = window.geo1;

	const tube1 = geo1.create_node('tube');

	let container = await tube1.request_container();
	const core_group = container.core_content()!;
	const {geometry} = core_group.objects_with_geo()[0];

	assert.ok(geometry);
	assert.equal(container.points_count(), 76);
});
