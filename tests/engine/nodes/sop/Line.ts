QUnit.test('line simple', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');

	let container;

	container = await line1.compute();
	assert.equal(container.pointsCount(), 2);
});
