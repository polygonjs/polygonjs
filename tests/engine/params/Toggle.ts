QUnit.test('toggle evals correctly when set to different values', async (assert) => {
	const scene = window.scene;

	const materials1 = scene.root.create_node('materials');
	const mesh_standard1 = materials1.create_node('mesh_basic');
	const use_texture_map = mesh_standard1.p.use_texture_map;

	use_texture_map.set(0);
	use_texture_map.compute();
	assert.equal(use_texture_map.value, false);

	use_texture_map.set(1);
	use_texture_map.compute();
	assert.equal(use_texture_map.value, true);

	use_texture_map.set(-1);
	use_texture_map.compute();
	assert.equal(use_texture_map.value, false);

	use_texture_map.set(2);
	use_texture_map.compute();
	assert.equal(use_texture_map.value, true);
});
