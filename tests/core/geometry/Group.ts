QUnit.test('attrib_names_matching_mask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');

	const attrib_create_blend1 = geo1.createNode('attrib_create');
	attrib_create_blend1.p.name.set('blend');
	attrib_create_blend1.set_input(0, box1);

	const attrib_create_blend2 = geo1.createNode('attrib_create');
	attrib_create_blend2.p.name.set('blend2');
	attrib_create_blend2.set_input(0, attrib_create_blend1);

	const attrib_create_blend3 = geo1.createNode('attrib_create');
	attrib_create_blend3.p.name.set('restP');
	attrib_create_blend3.set_input(0, attrib_create_blend2);

	const container = await attrib_create_blend3.request_container();
	const core_group = container.core_content()!;

	assert.deepEqual(core_group.attrib_names().sort(), ['position', 'normal', 'uv', 'blend', 'blend2', 'restP'].sort());
	assert.deepEqual(core_group.attrib_names_matching_mask('blend*').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(core_group.attrib_names_matching_mask('pos*').sort(), ['position'].sort());
	assert.deepEqual(core_group.attrib_names_matching_mask('pos').sort(), [].sort());
	assert.deepEqual(core_group.attrib_names_matching_mask('blend*,pos').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(
		core_group.attrib_names_matching_mask('blend*,pos*').sort(),
		['blend', 'blend2', 'position'].sort()
	);
});
