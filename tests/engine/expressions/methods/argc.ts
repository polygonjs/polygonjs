QUnit.test('expression argc simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	assert.equal(box1.name(), 'box1');
	const box2 = geo1.createNode('box');

	box2.p.size.set(`argc("1 17 15 3 7")`);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);

	box2.p.size.set(`argc("1 17 15 3 7 a r")`);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 7);
});
