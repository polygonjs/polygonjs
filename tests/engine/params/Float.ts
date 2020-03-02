QUnit.test('float eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const scale = geo1.p.scale;

	scale.set(2);
	await scale.compute();
	assert.equal(scale.value, 2);

	scale.set('2+1');
	await scale.compute();
	assert.equal(scale.value, 3);

	scale.set('(2+1) * 0.5');
	await scale.compute();
	assert.equal(scale.value, 1.5);
});

QUnit.test('float has_expression() returns false when removing the expression', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const param = box1.p.size;

	param.set(2);
	assert.notOk(param.has_expression());

	param.set('2+2');
	assert.ok(param.has_expression());

	param.set(2);
	assert.notOk(param.has_expression());

	param.set('-2.5');
	assert.notOk(param.has_expression());
	assert.equal(param.value, -2.5);

	param.set('-2.5*$F');
	assert.ok(param.has_expression());
});
