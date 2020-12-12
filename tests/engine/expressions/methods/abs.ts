QUnit.test('expression abs works', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const param = box1.p.size;

	param.set('abs(-5)');

	await param.compute();
	assert.equal(param.value, 5);

	param.set('abs(5)');
	await param.compute();
	assert.equal(param.value, 5);

	param.set('abs(-5*3.1)');
	await param.compute();
	assert.equal(param.value, 15.5);
});
