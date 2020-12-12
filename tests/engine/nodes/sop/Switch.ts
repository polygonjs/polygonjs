QUnit.test('SOP switch simple', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const switch1 = geo1.createNode('switch');
	switch1.set_input(0, box1);
	switch1.set_input(1, sphere1);

	switch1.p.input.set(0);

	let container = await switch1.request_container();
	// let core_group = container.core_content();
	// let {geometry} = core_group.objects()[0];

	assert.equal(container.points_count(), 24);

	switch1.p.input.set(1);
	container = await sphere1.request_container();
	// core_group = container.core_content();
	// ({geometry} = core_group.objects()[0]);

	assert.equal(container.points_count(), 961);
});
