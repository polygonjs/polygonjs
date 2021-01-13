QUnit.test('blend obj simple', async (assert) => {
	const scene = window.scene;
	const root = window.root;

	const geo1 = window.geo1;
	const geo2 = root.createNode('geo');
	const geo3 = root.createNode('geo');
	geo1.p.t.x.set(1);
	geo2.p.t.y.set(1);
	geo3.p.t.z.set(5);

	await scene.waitForCooksCompleted();

	scene.threejsScene().updateMatrixWorld(true);

	const blend1 = root.createNode('blend');
	blend1.p.blend.set(0.5);
	await scene.waitForCooksCompleted();
	assert.deepEqual(blend1.object.position.toArray(), [0.5, 0.5, 0]);

	blend1.p.blend.set(0);
	await scene.waitForCooksCompleted();
	assert.deepEqual(blend1.object.position.toArray(), [1, 0, 0]);

	blend1.p.blend.set(1);
	await scene.waitForCooksCompleted();
	assert.deepEqual(blend1.object.position.toArray(), [0, 1, 0]);

	blend1.p.object0.set(geo3.fullPath());
	blend1.p.blend.set(0);
	await scene.waitForCooksCompleted();
	assert.deepEqual(blend1.object.position.toArray(), [0, 0, 5]);
});
