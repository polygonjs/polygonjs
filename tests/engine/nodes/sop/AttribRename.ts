QUnit.test('attrib_rename simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const attrib_create1 = geo1.createNode('attribCreate');
	const attrib_rename1 = geo1.createNode('attribRename');
	attrib_create1.setInput(0, plane1);
	attrib_rename1.setInput(0, attrib_create1);

	attrib_create1.p.name.set('test');
	attrib_create1.p.value1.set('@ptnum');
	attrib_rename1.p.old_name.set('test');
	attrib_rename1.p.new_name.set('test2');

	let container, core_group, geometry;
	container = await attrib_create1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.ok(geometry.getAttribute('test'));
	assert.notOk(geometry.getAttribute('test2'));

	container = await attrib_rename1.request_container();
	core_group = container.core_content()!;
	geometry = core_group.objects_with_geo()[0].geometry;
	assert.notOk(geometry.getAttribute('test'));
	assert.ok(geometry.getAttribute('test2'));
});
