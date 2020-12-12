QUnit.test('expression precision works on a float', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set('precision(-5.12657, 2)');

	await box1.p.size.compute();
	assert.in_delta(box1.p.size.value, -5.12, 0.001);

	box1.p.size.set('precision(5, 2)');
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 5);

	box1.p.size.set('precision(-5*3.1+0.1, 2)');
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, -15.4);
});

QUnit.test('expression precision works on a string', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const attribtransfer1 = geo1.createNode('attrib_transfer');
	attribtransfer1.set_input(0, box1);
	attribtransfer1.set_input(0, box2);

	const param = attribtransfer1.p.src_group;
	param.set('`precision(-5.12657, 2)`');

	await param.compute();
	assert.equal(param.value, '-5.12');

	param.set('`precision(5, 2)`');
	await param.compute();
	assert.equal(param.value, '5.00');

	param.set('`precision(-5*3.1+0.1, 2)`');
	await param.compute();
	assert.equal(param.value, '-15.40');
});
