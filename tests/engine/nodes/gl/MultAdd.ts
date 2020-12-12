QUnit.test('gl mult_add default values', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('mesh_basic_builder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const mult_add1 = material_basic_builder1.createNode('mult_add');

	assert.equal(mult_add1.pv.value, 0);
	assert.equal(mult_add1.pv.pre_add, 0);
	assert.equal(mult_add1.pv.mult, 1);
	assert.equal(mult_add1.pv.post_add, 0);
});
