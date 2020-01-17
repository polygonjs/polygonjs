QUnit.test('animation_copy simple', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.create_node('file');
	const hierarchy1 = geo1.create_node('hierarchy');
	const animation_copy1 = geo1.create_node('animation_copy');
	const animation_mixer1 = geo1.create_node('animation_mixer');

	hierarchy1.set_input(0, file1);
	animation_copy1.set_input(0, hierarchy1);
	animation_copy1.set_input(1, file1);

	hierarchy1.param('mode').set(1); // remove parent
	file1.param('url').set('/examples/models/soldier.glb');

	let container, size;

	container = await animation_copy1.request_container();
	assert.equal(container.points_count(), 7434); // I should really do a better test
});
