QUnit.test('csg/scale', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const cube1 = csgNetwork1.createNode('cube');
	const scale1 = csgNetwork1.createNode('scale');

	scale1.setInput(0, cube1);
	scale1.p.s.x.set(2);
	scale1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	let core_group = container.coreContent();
	assert.equal(core_group?.objectsWithGeo().length, 1, '1 object');
	let geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 108);
	assert.in_delta(container.boundingBox().min.x, -1, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
