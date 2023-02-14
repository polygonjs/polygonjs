QUnit.test('csg/extrudeLinear with non closed shapes', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const arc1 = csgNetwork1.createNode('arc');
	const extrudeLinear1 = csgNetwork1.createNode('extrudeLinear');

	extrudeLinear1.setInput(0, arc1);
	extrudeLinear1.flags.display.set(true);

	await csgNetwork1.compute();

	assert.equal(extrudeLinear1.states.error.message(), `node internal error: 'Error: extruded path must be closed'.`);
	assert.equal(csgNetwork1.states.error.message(), `displayNode /geo1/csgNetwork1/extrudeLinear1 is invalid`);
});

QUnit.test('csg/extrudeLinear with closed shapes', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const circle1 = csgNetwork1.createNode('circle');
	const extrudeLinear1 = csgNetwork1.createNode('extrudeLinear');

	extrudeLinear1.setInput(0, circle1);
	extrudeLinear1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 1116);
	assert.in_delta(container.boundingBox().min.x, -1, 0.002);
	assert.in_delta(container.boundingBox().max.x, 1, 0.002);
	assert.notOk(csgNetwork1.isDirty(), 'box is dirty');
});
