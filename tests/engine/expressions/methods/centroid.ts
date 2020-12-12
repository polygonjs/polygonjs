QUnit.test('expression centroid works with path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.set_input(0, box1);
	transform1.p.t.x.set(3);
	transform1.p.t.y.set(5);
	transform1.p.t.z.set(-10);
	transform1.p.scale.set(3);

	const transform2 = geo1.createNode('transform');
	transform2.set_input(0, transform1);

	const box2 = geo1.createNode('box');

	box2.p.size.set("centroid('../transform1', 'x')");
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);

	box2.p.size.set("centroid('../transform1', 'y')");
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);

	box2.p.size.set("centroid('../transform1', 'z')");
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, -10);

	transform1.p.t.x.set(4);
	transform2.p.t.x.set('-$CEX');
	await transform2.p.t.x.compute();
	assert.equal(transform2.p.t.x.value, -4);

	transform2.p.t.x.set('-$CEY');
	await transform2.p.t.x.compute();
	assert.equal(transform2.p.t.x.value, -5);

	transform2.p.t.x.set('-$CEZ');
	await transform2.p.t.x.compute();
	assert.equal(transform2.p.t.x.value, 10);
});

QUnit.test('using $CEX on a node without inputs fails correctly', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set('$CEX');
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 1);
	assert.equal(box1.p.size.states.error.message, 'expression error: "$CEX" (invalid input (0))');
});
