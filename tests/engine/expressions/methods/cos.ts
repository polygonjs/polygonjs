QUnit.test('expression cos works', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set(2);
	await tx.compute();
	assert.equal(tx.value, 2);

	tx.set('cos(0)');
	await tx.compute();
	assert.equal(tx.value, 1);

	tx.set('cos($PI/2)');
	await tx.compute();
	assert.in_delta(tx.value, 0, 0.01);

	tx.set('cos($PI)');
	await tx.compute();
	assert.equal(tx.value, -1);
});
