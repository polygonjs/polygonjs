QUnit.test('bbox_scatter simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const bbox_scatter1 = geo1.createNode('bboxScatter');

	bbox_scatter1.setInput(0, box1);

	let container;
	container = await bbox_scatter1.compute();
	assert.equal(container.pointsCount(), 1331);

	bbox_scatter1.p.stepSize.set(0.5);
	container = await bbox_scatter1.compute();
	assert.equal(container.pointsCount(), 27);

	const transform = geo1.createNode('transform');
	transform.setInput(0, box1);
	bbox_scatter1.setInput(0, transform);
	bbox_scatter1.p.stepSize.set(0.1);
	transform.p.t.set([5, -10, 17]);
	container = await bbox_scatter1.compute();
	assert.equal(container.pointsCount(), 1210);
});
