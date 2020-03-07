QUnit.test('expression ch works in relative', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const box2 = geo1.create_node('box');

	box1.p.size.set(2);
	box2.p.size.set("ch('../box1/size')");

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 2);

	box1.p.size.set(3);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);

	box1.p.size.set('3+2');
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);
});

QUnit.test('expression ch works in absolute', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.create_node('box');
	const box2 = geo1.create_node('box');

	box1.p.size.set(2);
	box2.p.size.set("ch('/geo1/box1/size')");

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 2);

	box1.p.size.set(3);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);

	box1.p.size.set('3+2');
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);
});
