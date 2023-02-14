QUnit.test('sop/CsgNetwork errors if the displayNode does', async (assert) => {
	const geo1 = window.geo1;

	const csgNetwork1 = geo1.createNode('csgNetwork');
	const sphere1 = csgNetwork1.createNode('sphere');
	const cube1 = csgNetwork1.createNode('cube');
	const boolean1 = csgNetwork1.createNode('boolean');
	boolean1.setInput(0, sphere1);
	boolean1.setInput(1, cube1);
	cube1.p.sizes.set([2.9, 0.6, 0.6]);
	boolean1.flags.display.set(true);

	let container = await csgNetwork1.compute();
	assert.notOk(csgNetwork1.states.error.message());
	assert.equal(container.pointsCount(), 96);
	assert.in_delta(container.boundingBox().min.y, -0.3, 0.001);

	boolean1.setInput(1, null);
	container = await csgNetwork1.compute();
	assert.equal(csgNetwork1.states.error.message(), 'displayNode /geo1/csgNetwork1/boolean1 is invalid');

	boolean1.setInput(1, cube1);
	container = await csgNetwork1.compute();
	assert.notOk(csgNetwork1.states.error.message());
	assert.equal(container.pointsCount(), 96);
	assert.in_delta(container.boundingBox().min.y, -0.3, 0.001);
});
