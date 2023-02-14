QUnit.test('csg/expand with 2D primitive', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const arc1 = csgNetwork1.createNode('arc');
	const expand1 = csgNetwork1.createNode('expand');

	expand1.setInput(0, arc1);
	expand1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	let core_group = container.coreContent();
	let geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 324);
	assert.in_delta(container.boundingBox().min.x, -1.099, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1.099, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');

	expand1.p.delta.set(0.5);
	container = await csgNetwork1.compute();
	core_group = container.coreContent();
	geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 324);
	assert.in_delta(container.boundingBox().min.x, -1.497, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1.497, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');

	expand1.p.segments.set(5);
	container = await csgNetwork1.compute();
	core_group = container.coreContent();
	geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 420);
	assert.in_delta(container.boundingBox().min.x, -1.497, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1.497, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
