QUnit.test('plane simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');

	let container = await plane1.compute();
	// const core_group = container.coreContent();
	// const {geometry} = core_group.objects()[0];

	assert.equal(container.boundingBox().max.x, 0.5);
	assert.equal(container.boundingBox().min.x, -0.5);
});

QUnit.skip('plane with input', (assert) => {});
