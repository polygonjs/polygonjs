async function with_file(path: string) {
	const geo1 = window.geo1;
	const file1 = geo1.create_node('file');
	file1.param('url').set(path);

	const container = await file1.request_container_p();
	return container;
}

QUnit.test('file simple', async (assert) => {
	const geo1 = window.geo1;

	const file1 = geo1.create_node('file');
	file1.param('url').set('/tests/fixtures/files/geometries/male03.obj');
	assert.ok(file1.is_dirty());

	const merge1 = geo1.create_node('merge');
	merge1.set_input(0, file1);

	let container;
	container = await merge1.request_container();
	assert.ok(!file1.is_dirty());
	let core_group = container.core_content();
	console.log(core_group.objects());
	let {geometry} = core_group.objects()[0];
	assert.equal(container.points_count(), 15012);

	file1.param('url').set('/tests/fixtures/files/geometries/box.obj');
	assert.ok(file1.is_dirty());

	container = await merge1.request_container();
	assert.ok(!file1.is_dirty());
	core_group = container.core_content();
	({geometry} = core_group.objects()[0]);
	assert.equal(container.points_count(), 36);

	// set error state
	file1.param('url').set('/tests/fixtures/files/geometries/doesnotexist.obj');
	assert.ok(file1.is_dirty());
	container = await merge1.request_container();
	assert.ok(!file1.is_dirty());
	assert.ok(file1.is_errored());

	// this only works if I have a path catch all in routes.db
	// get '*path' => 'errors#route_not_found'
	// assert.equal(file1.error_message(), "could not load geometry from /tests/fixtures/files/geometries/doesnotexist.obj (Error: THREE.OBJLoader: Unexpected line: \"<!DOCTYPE html>\")");
	core_group = container.core_content();
	assert.equal(core_group.objects().length, 0);

	// clear error state
	file1.param('url').set('/tests/fixtures/files/geometries/box.obj');
	assert.ok(file1.is_dirty());
	container = await merge1.request_container();
	assert.ok(!file1.is_dirty());
	assert.ok(!file1.is_errored());
	core_group = container.core_content();
	//geometry = group.children[0].geometry
	assert.ok(core_group);
	assert.equal(container.points_count(), 36);
});

QUnit.test('file obj wolf', async (assert) => {
	const container = await with_file('/examples/models/wolf.obj');
	assert.equal(container.points_count(), 5352);
});
QUnit.test('file json wolf', async (assert) => {
	const container = await with_file('/examples/models/wolf.json');
	assert.equal(container.points_count(), 5352);
});
QUnit.test('file glb stork', async (assert) => {
	const container = await with_file('/examples/models/stork.glb');
	assert.equal(container.points_count(), 358);
});
QUnit.test('file glb soldier', async (assert) => {
	const container = await with_file('/examples/models/soldier.glb');
	assert.equal(container.points_count(), 7434);
});
QUnit.test('file glb json', async (assert) => {
	const container = await with_file('/examples/models/parrot.glb');
	assert.equal(container.points_count(), 497);
});
QUnit.test('file glb horse', async (assert) => {
	const container = await with_file('/examples/models/horse.glb');
	assert.equal(container.points_count(), 796);
});
QUnit.test('file glb flamingo', async (assert) => {
	const container = await with_file('/examples/models/flamingo.glb');
	assert.equal(container.points_count(), 337);
});
