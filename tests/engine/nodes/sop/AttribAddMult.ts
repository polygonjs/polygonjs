QUnit.test('attrib_add_mult simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const attrib_create1 = geo1.create_node('attrib_create');
	const attrib_add_mult1 = geo1.create_node('attrib_add_mult');
	attrib_create1.set_input(0, plane1);
	attrib_add_mult1.set_input(0, attrib_create1);

	attrib_create1.param('name').set('test');
	attrib_create1.param('valuex').set_expression('@ptnum');
	attrib_add_mult1.param('name').set('test');
	attrib_add_mult1.param('mult').set(0.5);

	let container, core_group, values;
	container = await attrib_create1.request_container();
	core_group = container.core_content();
	values = core_group.points().map((p) => p.attrib_value('test'));
	assert.deepEqual(values, [0, 1, 2, 3]);

	container = await attrib_add_mult1.request_container();
	core_group = container.core_content();
	values = core_group.points().map((p) => p.attrib_value('test'));
	assert.deepEqual(values, [0, 0.5, 1, 1.5]);
});
