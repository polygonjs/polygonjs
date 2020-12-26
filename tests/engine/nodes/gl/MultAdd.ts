QUnit.test('gl multAdd default values', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const multAdd1 = material_basic_builder1.createNode('multAdd');

	assert.equal(multAdd1.pv.value, 0);
	assert.equal(multAdd1.pv.pre_add, 0);
	assert.equal(multAdd1.pv.mult, 1);
	assert.equal(multAdd1.pv.post_add, 0);
});
