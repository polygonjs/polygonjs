QUnit.test('noise simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const noise1 = geo1.createNode('noise');
	noise1.setInput(0, sphere1);
	noise1.p.use_normals.set(1);

	let container = await noise1.request_container();
	// const core_group = container.core_content();
	// const {geometry} = core_group.objects()[0];

	console.log(container.bounding_box().min.y);
	assert.in_delta(container.bounding_box().max.y, 1.3, 0.1);
	assert.in_delta(container.bounding_box().min.y, -1.3, 0.1);
});

QUnit.skip('noise on flamingo', (assert) => {
	// load example flamingo glb
	assert.equal(0, 1);
});
