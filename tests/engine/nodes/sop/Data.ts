async function with_data(data_json?: object) {
	const geo1 = window.geo1;
	const data1 = geo1.createNode('data');
	if (data_json) {
		data1.p.data.set(JSON.stringify(data_json));
	}
	const container = await data1.compute();
	return container;
}

QUnit.test('data default', async (assert) => {
	const container = await with_data();
	assert.equal(container.pointsCount(), 13);
	assert.equal(container.coreContent()!.points()[0].attribValue('value'), -40);
});

QUnit.test('data with position', async (assert) => {
	const data = [
		{value: 1, position: [-1, 0, 1]},
		{value: 2, position: [-2, 0, 1]},
	];
	const container = await with_data(data);
	assert.equal(container.pointsCount(), 2);
	const points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('value'), 1);
	assert.equal(points[1].attribValue('value'), 2);
	assert.deepEqual(points[0].position().toArray(), [-1, 0, 1]);
	assert.deepEqual(points[1].position().toArray(), [-2, 0, 1]);
});

QUnit.test('data with position remaped', async (assert) => {
	const data = [
		{value: 1, P: [-1, 0, 1]},
		{value: 2, P: [-2, 0, 1]},
	];
	const container = await with_data(data);
	assert.equal(container.pointsCount(), 2);
	const points = container.coreContent()!.points();
	assert.equal(points[0].attribValue('value'), 1);
	assert.equal(points[1].attribValue('value'), 2);
	assert.deepEqual(points[0].position().toArray(), [-1, 0, 1]);
	assert.deepEqual(points[1].position().toArray(), [-2, 0, 1]);
});
