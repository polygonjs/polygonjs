QUnit.test('expression points works with path', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const attrib_create1 = geo1.create_node('attrib_create');
	const attrib_create2 = geo1.create_node('attrib_create');

	attrib_create1.set_input(0, plane1);
	attrib_create2.set_input(0, attrib_create1);

	attrib_create1.p.name.set('h');
	attrib_create1.p.value1.set('@ptnum');

	attrib_create2.p.name.set('t');
	attrib_create2.p.value1.set('point("../attrib_create1", "h", 2)');

	const container = await attrib_create2.request_container();
	const array = container.core_content()!.objects_with_geo()[0].geometry.attributes['t'].array as number[];
	assert.deepEqual(array.join(','), [2, 2, 2, 2].join(','));
});

QUnit.test('expression points_count works with input index', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const attrib_create1 = geo1.create_node('attrib_create');
	const attrib_create2 = geo1.create_node('attrib_create');

	attrib_create1.set_input(0, plane1);
	attrib_create2.set_input(0, attrib_create1);

	attrib_create1.p.name.set('h');
	attrib_create1.p.value1.set('@ptnum');

	attrib_create2.p.name.set('t');
	attrib_create2.p.value1.set('point(0, "h", 2)');

	const container = await attrib_create2.request_container();
	const array = container.core_content()!.objects_with_geo()[0].geometry.attributes['t'].array as number[];
	assert.deepEqual(array.join(','), [2, 2, 2, 2].join(','));
});
