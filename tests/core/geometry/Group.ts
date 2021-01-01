QUnit.test('attrib_names_matching_mask', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');

	const attrib_create_blend1 = geo1.createNode('attribCreate');
	attrib_create_blend1.p.name.set('blend');
	attrib_create_blend1.setInput(0, box1);

	const attrib_create_blend2 = geo1.createNode('attribCreate');
	attrib_create_blend2.p.name.set('blend2');
	attrib_create_blend2.setInput(0, attrib_create_blend1);

	const attrib_create_blend3 = geo1.createNode('attribCreate');
	attrib_create_blend3.p.name.set('restP');
	attrib_create_blend3.setInput(0, attrib_create_blend2);

	const container = await attrib_create_blend3.requestContainer();
	const core_group = container.coreContent()!;

	assert.deepEqual(core_group.attribNames().sort(), ['position', 'normal', 'uv', 'blend', 'blend2', 'restP'].sort());
	assert.deepEqual(core_group.attribNamesMatchingMask('blend*').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(core_group.attribNamesMatchingMask('pos*').sort(), ['position'].sort());
	assert.deepEqual(core_group.attribNamesMatchingMask('pos').sort(), [].sort());
	assert.deepEqual(core_group.attribNamesMatchingMask('blend*,pos').sort(), ['blend', 'blend2'].sort());
	assert.deepEqual(core_group.attribNamesMatchingMask('blend*,pos*').sort(), ['blend', 'blend2', 'position'].sort());
});
