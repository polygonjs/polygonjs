QUnit.test('subdivide simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const subdivide1 = geo1.createNode('subdivide');

	subdivide1.set_input(0, box1);

	let container = await subdivide1.request_container();
	let core_group = container.core_content()!;
	assert.equal(core_group.points_count(), 144);

	subdivide1.p.subdivisions.set(3);
	container = await subdivide1.request_container();
	core_group = container.core_content()!;
	assert.equal(core_group.points_count(), 2304);
});
