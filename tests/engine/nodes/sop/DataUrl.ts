QUnit.test('data_url simple', async (assert) => {
	const geo1 = window.geo1;

	const data_url1 = geo1.create_node('data_url');

	let container;
	container = await data_url1.request_container_p();
	assert.ok(!data_url1.is_dirty());
	assert.equal(container.points_count(), 2);

	await scene.root().process_queue();

	data_url1.param('url').set('/examples/data_url/default.json');
	sleep(500); // necessary to import the loader (maybe?)
	container = await data_url1.request_container_p();

	assert.ok(!data_url1.is_dirty());
	assert.equal(container.points_count(), 8);
});
