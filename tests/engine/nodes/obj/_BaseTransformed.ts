QUnit.test('obj nodes can be parented to each other', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const world_root = scene.default_scene.children[0];
	console.log(world_root);
	assert.equal(world_root.children.length, 2);
	assert.equal(geo1.object.children[0].children.length, 0);

	const geo2 = scene.root.create_node('geo');

	await scene.wait_for_cooks_completed();
	assert.equal(world_root.children.length, 3);
	assert.equal(geo1.object.children[0].children.length, 0);

	geo2.set_input(0, geo1);
	await scene.wait_for_cooks_completed();
	assert.equal(world_root.children.length, 2);
	assert.equal(geo1.object.children[0].children.length, 1);

	geo2.set_input(0, null);
	await scene.wait_for_cooks_completed();
	assert.equal(world_root.children.length, 3);
	assert.equal(geo1.object.children[0].children.length, 0);
});
