QUnit.test('obj nodes can be parented to each other', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const world_root = scene.threejsScene();
	assert.equal(world_root.children.length, 2);
	assert.equal(geo1.object.children[0].children.length, 0);

	const geo2 = scene.root().createNode('geo');

	await scene.waitForCooksCompleted();
	assert.equal(world_root.children.length, 3);
	assert.equal(geo1.object.children[0].children.length, 0);

	geo2.setInput(0, geo1);
	await scene.waitForCooksCompleted();
	assert.equal(world_root.children.length, 2);
	assert.equal(geo1.object.children[0].children.length, 1);

	geo2.setInput(0, null);
	await scene.waitForCooksCompleted();
	assert.equal(world_root.children.length, 3);
	assert.equal(geo1.object.children[0].children.length, 0);
});

QUnit.test('obj nodes can keep their position on input change', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const null1 = scene.root().createNode('null');
	const null2 = scene.root().createNode('null');

	null2.setInput(0, null1);
	geo1.setInput(0, null1);

	null1.p.t.y.set(1);

	geo1.p.t.y.set(-0.6);
	geo1.p.t.z.set(2);
	null2.p.t.z.set(7);
	null2.p.t.y.set(-4);

	await scene.waitForCooksCompleted();
	assert.deepEqual(geo1.object.position.toArray(), [0, -0.6, 2]);

	geo1.p.keepPosWhenParenting.set(1);
	// we remove input so that we parent under /
	geo1.setInput(0, null);
	await scene.waitForCooksCompleted();
	assert.equal(geo1.pv.t.y, 0.4, 'ty');
	assert.equal(geo1.pv.t.z, 2, 'tz');

	// / -> parent A
	geo1.setInput(0, null2);
	await geo1.compute();
	assert.equal(geo1.pv.t.y, 3.4, 'ty');
	assert.equal(geo1.pv.t.z, -5, 'tz');

	// parent A -> parent B
	geo1.setInput(0, null1);
	await geo1.compute();
	assert.in_delta(geo1.pv.t.y, -0.6, 0.00001, 'ty');
	assert.equal(geo1.pv.t.z, 2, 'tz');
});
