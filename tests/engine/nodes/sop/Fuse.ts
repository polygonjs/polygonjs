QUnit.test('fuse simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const bbox_scatter1 = geo1.createNode('bboxScatter');
	const fuse1 = geo1.createNode('fuse');

	bbox_scatter1.setInput(0, box1);
	fuse1.setInput(0, bbox_scatter1);

	let container;

	container = await bbox_scatter1.requestContainer();
	assert.equal(container.pointsCount(), 1000);

	container = await fuse1.requestContainer();
	assert.equal(container.pointsCount(), 1000);

	fuse1.p.dist.set(0.4);
	container = await fuse1.requestContainer();
	assert.equal(container.pointsCount(), 27);

	fuse1.p.dist.set(0.2);
	container = await fuse1.requestContainer();
	assert.equal(container.pointsCount(), 125);
});
