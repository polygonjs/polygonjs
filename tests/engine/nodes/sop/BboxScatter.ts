QUnit.test('bbox_scatter simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const bbox_scatter1 = geo1.createNode('bboxScatter');

	bbox_scatter1.setInput(0, box1);

	let container;
	container = await bbox_scatter1.requestContainer();
	assert.equal(container.pointsCount(), 1000);

	bbox_scatter1.p.stepSize.set(0.5);
	container = await bbox_scatter1.requestContainer();
	assert.equal(container.pointsCount(), 8);
});
