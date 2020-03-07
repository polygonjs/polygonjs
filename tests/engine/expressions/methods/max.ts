QUnit.test('expression max works', async (assert) => {
	const geo1 = window.geo1;

	const tx = geo1.p.t.x;

	tx.set('max(12,17)');
	await tx.compute();
	assert.equal(tx.value, 17);

	tx.set('max(5,-1)');
	await tx.compute();
	assert.equal(tx.value, 5);
});
