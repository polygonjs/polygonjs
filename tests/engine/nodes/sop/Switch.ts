QUnit.test('SOP switch simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const switch1 = geo1.createNode('switch');
	switch1.setInput(0, box1);
	switch1.setInput(1, sphere1);

	switch1.p.input.set(0);

	let container = await switch1.compute();
	// let core_group = container.coreContent();
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.pointsCount(), 24);

	switch1.p.input.set(1);
	container = await sphere1.compute();
	// core_group = container.coreContent();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.pointsCount(), 961);
});
