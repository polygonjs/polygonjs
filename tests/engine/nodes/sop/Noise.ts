QUnit.test('noise simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const noise1 = geo1.createNode('noise');
	noise1.setInput(0, sphere1);
	noise1.p.useNormals.set(1);

	let container = await noise1.requestContainer();
	// const core_group = container.coreContent();
	// const {geometry} = core_group.objects()[0];

	console.log(container.boundingBox().min.y);
	assert.in_delta(container.boundingBox().max.y, 1.3, 0.1);
	assert.in_delta(container.boundingBox().min.y, -1.3, 0.1);
});

QUnit.skip('noise on flamingo', (assert) => {
	// load example flamingo glb
	assert.equal(0, 1);
});
