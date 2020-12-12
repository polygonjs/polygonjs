QUnit.test('blend obj simple', async (assert) => {
	const scene = window.scene;
	const root = window.root;

	const geo1 = window.geo1;
	const geo2 = root.createNode('geo');
	const geo3 = root.createNode('geo');
	geo1.p.t.x.set(1);
	geo2.p.t.y.set(1);
	geo3.p.t.z.set(5);

	await scene.wait_for_cooks_completed();

	scene.default_scene.updateMatrixWorld(true);

	const blend1 = root.createNode('blend');
	blend1.p.blend.set(0.5);
	await scene.wait_for_cooks_completed();
	assert.deepEqual(blend1.object.position.toArray(), [0.5, 0.5, 0]);

	blend1.p.blend.set(0);
	await scene.wait_for_cooks_completed();
	assert.deepEqual(blend1.object.position.toArray(), [1, 0, 0]);

	blend1.p.blend.set(1);
	await scene.wait_for_cooks_completed();
	assert.deepEqual(blend1.object.position.toArray(), [0, 1, 0]);

	blend1.p.object0.set(geo3.full_path());
	blend1.p.blend.set(0);
	await scene.wait_for_cooks_completed();
	assert.deepEqual(blend1.object.position.toArray(), [0, 0, 5]);
});
