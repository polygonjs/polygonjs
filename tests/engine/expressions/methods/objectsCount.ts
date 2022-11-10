QUnit.test('expression/objectsCount with node path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');
	const null1 = geo1.createNode('null');

	const plane1 = geo1.createNode('plane');

	null1.setInput(0, merge1);
	merge1.setInput(0, box1);
	merge1.setInput(1, box2);

	const param = plane1.p.size.x;
	param.set(`objectsCount('${null1.path()}')`);

	await param.compute();
	assert.equal(param.value, 2);

	merge1.setInput(2, box3);
	await param.compute();
	assert.equal(param.value, 3);
});

QUnit.test('expression/objectsCount with index', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const box3 = geo1.createNode('box');
	const merge1 = geo1.createNode('merge');

	const box4 = geo1.createNode('box');

	merge1.setInput(0, box1);
	merge1.setInput(1, box2);
	box4.setInput(0, merge1);

	const param = box4.p.sizes.x;
	param.set(`objectsCount(0)`);

	await param.compute();
	assert.equal(param.value, 2);

	merge1.setInput(2, box3);
	await param.compute();
	assert.equal(param.value, 3);
});
