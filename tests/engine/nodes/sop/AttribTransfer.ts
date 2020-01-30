QUnit.test('attrib_transfer simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	plane1.p.direction.set([0, 1, 0]);
	const add1 = geo1.create_node('add');
	const attrib_create1 = geo1.create_node('attrib_create');
	const attrib_create2 = geo1.create_node('attrib_create');
	const attrib_transfer1 = geo1.create_node('attrib_transfer');

	attrib_create1.set_input(0, plane1);
	attrib_create2.set_input(0, add1);
	attrib_transfer1.set_input(0, attrib_create1);
	attrib_transfer1.set_input(1, attrib_create2);

	add1.p.position.set([0.5, 0, 0.5]);
	attrib_create1.p.name.set('test');
	attrib_create2.p.name.set('test');
	attrib_create2.p.value1.set(1);
	attrib_transfer1.p.name.set('test');

	let container, core_group, array;
	container = await attrib_transfer1.request_container();
	core_group = container.core_content()!;
	array = core_group.objects()[0].geometry.getAttribute('test').array;
	assert.deepEqual(Array.from(array), [0, 1, 1, 1]);

	// attrib_transfer1.p.distance_threshold.set(0.5);
	// container = await attrib_transfer1.request_container();
	// core_group = container.core_content()!;
	// array = core_group.objects()[0].geometry.getAttribute('test').array;
	// assert.deepEqual(Array.from(array), [0, 0, 0, 1]);
});
