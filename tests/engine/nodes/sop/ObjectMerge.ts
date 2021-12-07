QUnit.test('object_merge simple', async (assert) => {
	const geo1 = window.geo1;
	const geo2 = window.scene.root().createNode('geo');

	const plane1 = geo2.createNode('plane');
	const object_merge1 = geo1.createNode('objectMerge');

	object_merge1.p.geometry.set(plane1.path());

	let container;

	container = await object_merge1.compute();
	assert.equal(container.pointsCount(), 4);
});
