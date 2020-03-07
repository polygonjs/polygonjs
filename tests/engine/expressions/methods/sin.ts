QUnit.test('expression sin works', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set(2);
	await tx.compute();
	assert.equal(tx.value, 2);

	tx.set('sin(0)');
	await tx.compute();
	assert.equal(tx.value, 0);

	tx.set('sin($PI/2)');

	await tx.compute();
	assert.equal(tx.value, 1);

	tx.set('sin($PI)');
	await tx.compute();
	assert.in_delta(tx.value, 0, 0.01);
});
