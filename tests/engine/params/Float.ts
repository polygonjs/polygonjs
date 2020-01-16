QUnit.test('float eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const scale = geo1.p.scale;

	scale.set(2);
	await scale.compute();
	assert.equal(scale.value, 2);

	scale.set_expression('2+1');
	await scale.compute();
	assert.equal(scale.value, 3);

	scale.set_expression('(2+1) * 0.5');
	await scale.compute();
	assert.equal(scale.value, 1.5);
});
