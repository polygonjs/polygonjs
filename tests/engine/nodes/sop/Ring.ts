QUnit.test('sop/ring simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const ring1 = geo1.createNode('ring');

	let container = await ring1.compute();
	const coreGroup = container.coreContent();
	const geometry = coreGroup?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 297);
	assert.equal(container.boundingBox().min.x, -1);
	assert.notOk(ring1.isDirty(), 'box is dirty');

	ring1.p.outerRadius.set(2);
	assert.ok(ring1.isDirty(), 'box is dirty');
	container = await ring1.compute();
	assert.ok(!ring1.isDirty(), 'box is not dirty anymore');
	assert.equal(container.boundingBox().min.x, -2.0);
});
