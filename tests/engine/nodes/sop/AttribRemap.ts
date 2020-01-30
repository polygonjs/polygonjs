QUnit.skip('attrib_remap simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const attrib_create1 = geo1.create_node('attrib_create');
	const attrib_remap1 = geo1.create_node('attrib_remap');
	attrib_create1.set_input(0, plane1);
	attrib_remap1.set_input(0, attrib_create1);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set('@ptnum');
	attrib_remap1.p.name.set('test');

	let container, core_group, values;
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	values = core_group.points().map((p) => p.attrib_value('test'));
	assert.deepEqual(values, [0, 1, 2, 3]);

	container = await attrib_remap1.request_container();
	core_group = container.core_content()!;
	values = core_group.points().map((p) => p.attrib_value('test'));
	assert.deepEqual(values, [0, 1, 2, 3]);
});
