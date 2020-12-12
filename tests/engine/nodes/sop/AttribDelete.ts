QUnit.test('attrib_delete simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attrib_create');
	const attrib_delete1 = geo1.createNode('attrib_delete');
	attrib_create1.set_input(0, plane1);
	attrib_delete1.set_input(0, attrib_create1);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set('@ptnum');
	attrib_delete1.p.name.set('test');

	let container, core_group, geometry;
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry.getAttribute('test') != null);

	container = await attrib_delete1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.notOk(geometry.getAttribute('test') != null);
});
