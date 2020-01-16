QUnit.test('vector eval correctly when set to different values', async (assert) => {
	const geo1 = window.geo1;

	const t = geo1.p.t;
	const tx = t.x;
	const ty = t.y;
	const tz = t.z;

	tx.set(1);
	await t.compute();
	assert.deepEqual(t.value.toArray(), [1, 0, 0]);

	ty.set(0.7);
	await t.compute();
	assert.deepEqual(t.value.toArray(), [1, 0.7, 0]);

	tz.set(0.5);
	await t.compute();
	assert.deepEqual(t.value.toArray(), [1, 0.7, 0.5]);

	tx.set('2*0.5*0.5*0.5');
	await t.compute();
	assert.deepEqual(t.value.toArray(), [0.25, 0.7, 0.5]);
});
