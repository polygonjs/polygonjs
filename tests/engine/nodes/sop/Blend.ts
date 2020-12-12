QUnit.test('blend simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.set_input(0, box2);
	transform1.p.t.y.set(5);
	const blend1 = geo1.createNode('blend');
	blend1.set_input(0, box1);
	blend1.set_input(1, transform1);
	blend1.p.attrib_name.set('position');

	let container = await blend1.request_container();
	// const core_group = container.core_content()!;
	// const {geometry} = core_group.objects()[0];

	assert.equal(container.points_count(), 24);
	assert.equal(container.bounding_box().min.y, 2);

	blend1.p.blend.set(0.75);
	container = await blend1.request_container();
	assert.equal(container.bounding_box().min.y, 3.25);
});
