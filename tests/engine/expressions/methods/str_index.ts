QUnit.test('expression str_index simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const param = plane1.p.size.x;

	param.set('str_index()');
	await param.compute();
	assert.equal(param.value, -1);

	param.set('str_index( "test test" )');
	await param.compute();
	assert.equal(param.value, -1);

	param.set('str_index( "test test", "s" )');
	await param.compute();
	assert.equal(param.value, 2);

	param.set('str_index( "test test", " t" )');
	await param.compute();
	assert.equal(param.value, 4);
});
