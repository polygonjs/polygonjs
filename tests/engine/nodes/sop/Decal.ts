QUnit.test('decal simple', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const sphere1 = geo1.createNode('sphere');
	const decal1 = geo1.createNode('decal');

	decal1.setInput(0, sphere1);
	decal1.p.t.set([1, 0, 0]);

	let container = await decal1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 1602);
	assert.in_delta(container.boundingBox().min.x, 0.7, 0.1);
	assert.equal(container.boundingBox().min.y, -0.5);
	assert.in_delta(container.boundingBox().min.z, -0.5, 0.1);
	assert.in_delta(container.boundingBox().max.x, 1, 0.1);
	assert.equal(container.boundingBox().max.y, 0.5);
	assert.in_delta(container.boundingBox().max.z, 0.5, 0.1);
});
