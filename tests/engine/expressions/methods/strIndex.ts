QUnit.test('expression strIndex simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const param = plane1.p.size.x;

	param.set('strIndex()');
	await param.compute();
	assert.equal(param.value, -1);

	param.set('strIndex( "test test" )');
	await param.compute();
	assert.equal(param.value, -1);

	param.set('strIndex( "test test", "s" )');
	await param.compute();
	assert.equal(param.value, 2);

	param.set('strIndex( "test test", " t" )');
	await param.compute();
	assert.equal(param.value, 4);
});
