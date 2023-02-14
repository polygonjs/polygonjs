QUnit.test('csg/extrudeRotate with non closed shapes', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const arc1 = csgNetwork1.createNode('arc');
	const extrudeRotate1 = csgNetwork1.createNode('extrudeRotate');

	extrudeRotate1.setInput(0, arc1);
	extrudeRotate1.flags.display.set(true);

	await csgNetwork1.compute();

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 54);
	assert.in_delta(container.boundingBox().min.x, -1, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1, 0.002);
	assert.in_delta(container.boundingBox().min.y, 0, 0.002);
	assert.in_delta(container.boundingBox().max.y, 0, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});

QUnit.test('csg/extrudeRotate with closed shapes', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const circle1 = csgNetwork1.createNode('circle');
	const extrudeRotate1 = csgNetwork1.createNode('extrudeRotate');

	extrudeRotate1.setInput(0, circle1);
	extrudeRotate1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 4320);
	assert.in_delta(container.boundingBox().min.x, -1, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1, 0.002);
	assert.in_delta(container.boundingBox().min.y, -1, 0.002);
	assert.in_delta(container.boundingBox().max.y, 1, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
