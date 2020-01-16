QUnit.test('color eval correctly when set to different values', async (assert) => {
	const scene = window.scene;

	const materials1 = scene.root.create_node('materials');
	const mesh_standard1 = materials1.create_node('mesh_basic');
	const color = mesh_standard1.p.color;

	color.r.set(0);
	await color.compute();
	assert.deepEqual(color.value.toArray(), [0, 1, 1]);

	color.g.set(0.5);
	await color.compute();
	assert.deepEqual(color.value.toArray(), [0, 0.5, 1]);

	color.b.set(0.7);
	await color.compute();
	assert.deepEqual(color.value.toArray(), [0, 0.5, 0.7]);

	color.r.set_expression('2*0.5*0.5*0.5');
	await color.eval_p();
	assert.deepEqual(color.value.toArray(), [0.25, 0.5, 0.7]);
});
