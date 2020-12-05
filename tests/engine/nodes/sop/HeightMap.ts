QUnit.test('height map simple', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;

	const file1 = COP.create_node('image');

	const plane1 = geo1.create_node('plane');
	const height_map1 = geo1.create_node('height_map');

	height_map1.set_input(0, plane1);
	height_map1.p.texture.set(file1.full_path());
	height_map1.p.mult.set(100);

	let container = await height_map1.request_container();
	assert.equal(container.bounding_box().min.y, 6200);
	assert.equal(container.bounding_box().max.y, 10800);
});
