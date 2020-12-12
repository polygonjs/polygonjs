QUnit.test('fuse simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const bbox_scatter1 = geo1.createNode('bbox_scatter');
	const fuse1 = geo1.createNode('fuse');

	bbox_scatter1.set_input(0, box1);
	fuse1.set_input(0, bbox_scatter1);

	let container;

	container = await bbox_scatter1.request_container();
	assert.equal(container.points_count(), 1000);

	container = await fuse1.request_container();
	assert.equal(container.points_count(), 1000);

	fuse1.p.dist.set(0.4);
	container = await fuse1.request_container();
	assert.equal(container.points_count(), 27);

	fuse1.p.dist.set(0.2);
	container = await fuse1.request_container();
	assert.equal(container.points_count(), 125);
});
