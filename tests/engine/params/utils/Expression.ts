QUnit.test('a param can be set to errored with a bad expression then back to non errored', async (assert) => {
	const geo1 = window.geo1;

	const param = geo1.p.t.x;

	assert.notOk(param.states.error.active());
	param.set('1+');
	await param.compute();
	assert.notOk(param.value);
	assert.ok(param.states.error.active());
	assert.equal(param.states.error.message(), 'expression error: "1+" (cannot parse expression)');

	param.set('1+1');
	await param.compute();
	assert.equal(param.value, 2);
	assert.notOk(param.states.error.active());
	assert.equal(param.states.error.message(), null);
	assert.notOk(param.isDirty());
});

QUnit.test('a param can access another with its component full path', async (assert) => {
	const geo1 = window.geo1;

	const t = geo1.p.t;
	const ty = geo1.p.t.y;
	const tz = geo1.p.t.z;

	ty.set(1);
	tz.set('ch("ty")');
	await tz.compute();
	assert.equal(tz.value, 1);
	assert.deepEqual(t.value.toArray(), [0, 1, 1]);

	assert.ok(!tz.isDirty());
	ty.set(2.5);
	assert.ok(tz.isDirty());
	await tz.compute();
	assert.equal(tz.value, 2.5);
	tz.set('ch("ty")*2');
	assert.ok(tz.isDirty());
	await tz.compute();
	assert.equal(tz.value, 5);
	assert.deepEqual(t.value.toArray(), [0, 2.5, 5]);

	ty.set(-1);
	await tz.compute();
	assert.equal(tz.value, -2);
	assert.deepEqual(t.value.toArray(), [0, -1, -2]);
});
