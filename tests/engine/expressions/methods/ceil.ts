QUnit.test('expression ceil simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');

	box1.p.size.set('ceil(3.2)');

	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 4);
});
