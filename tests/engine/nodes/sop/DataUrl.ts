QUnit.test('data_url simple', async (assert) => {
	const geo1 = window.geo1;

	const data_url1 = geo1.create_node('data_url');

	let container;
	container = await data_url1.request_container();
	assert.ok(!data_url1.is_dirty);
	assert.equal(container.points_count(), 2);

	await window.scene.root.process_queue();

	data_url1.p.url.set('/examples/sop/data_url/default.json');
	window.sleep(500); // necessary to import the loader (maybe?)
	container = await data_url1.request_container();

	assert.ok(!data_url1.is_dirty);
	assert.equal(container.points_count(), 8);

	data_url1.p.url.set('/examples/sop/data_url/basic.json');
	window.sleep(500); // necessary to import the loader (maybe?)
	container = await data_url1.request_container();

	assert.ok(!data_url1.is_dirty);
	assert.equal(container.points_count(), 2);

	// and a non existing
	data_url1.p.url.set('/dataurl_doesnotexist.json');
	window.sleep(500); // necessary to import the loader (maybe?)
	container = await data_url1.request_container();

	assert.ok(!data_url1.is_dirty);
	assert.equal(container.points_count(), 0);
	assert.equal(
		data_url1.states.error.message,
		'could not load geometry from /dataurl_doesnotexist.json (Error: Request failed with status code 404)'
	);

	// restore it with a good url
	data_url1.p.url.set('/examples/sop/data_url/default.json');
	window.sleep(500); // necessary to import the loader (maybe?)
	container = await data_url1.request_container();
	assert.equal(container.points_count(), 8);
});
