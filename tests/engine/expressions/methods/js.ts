QUnit.test('expression js simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');

	box1.p.size.set("js('1+1')");

	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 2);

	const date = Date.now();
	box1.p.size.set("js('Date.now()')");
	await box1.p.size.compute();
	assert.more_than_or_equal(box1.p.size.value, date - 100);
	assert.in_delta(box1.p.size.value, date, 1000);
});
