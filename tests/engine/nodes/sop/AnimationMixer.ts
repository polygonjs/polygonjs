QUnit.test('animation_mixer simple', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.create_node('file');
	const animation_mixer1 = geo1.create_node('animation_mixer');

	animation_mixer1.set_input(0, file1);

	file1.p.url.set('/examples/models/soldier.glb');

	let container;

	container = await animation_mixer1.request_container();
	assert.equal(container.total_points_count(), 7434); // I should really do a better test
});
