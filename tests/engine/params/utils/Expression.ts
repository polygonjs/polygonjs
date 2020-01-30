QUnit.test('a param can be set to errored with a bad expression then back to non errored', async (assert) => {
	const geo1 = window.geo1;

	const param = geo1.p.t.x;

	assert.notOk(param.states.error.active);
	param.set('1+');
	await param.compute();
	assert.notOk(param.value);
	assert.ok(param.states.error.active);
	assert.equal(param.states.error.message, 'expression error: "1+" (cannot parse expression)');

	param.set('1+1');
	await param.compute();
	assert.equal(param.value, 2);
	assert.notOk(param.states.error.active);
	assert.equal(param.states.error.message, null);
	assert.notOk(param.is_dirty);
});
