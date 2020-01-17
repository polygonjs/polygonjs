QUnit.test('ambient light simple', async (assert) => {
	const scene = window.scene;
	scene.root.create_node('ambient_light');

	const container = await add1.request_container();
	const core_group = container.core_content()!;
	assert.equal(core_group.points().length, 1);
});
