QUnit.test('height map from mapbox', async (assert) => {
	const geo1 = window.geo1;
	const COP = window.COP;

	const mapbox_tile1 = COP.create_node('mapbox_tile');
	const plane1 = geo1.create_node('plane');
	const height_map1 = geo1.create_node('height_map');

	height_map1.set_input(0, plane1);
	height_map1.p.texture.set(mapbox_tile1.full_path());
	height_map1.p.mult.set(100);

	mapbox_tile1.p.type.set(0); // elevation
	await mapbox_tile1.request_container();
	let container;
	container = await height_map1.request_container();
	assert.equal(container.bounding_box().min.x, -0.5);
	assert.equal(container.bounding_box().max.x, 0.5);
	assert.equal(container.bounding_box().min.z, -0.5);
	assert.equal(container.bounding_box().max.z, 0.5);
	assert.in_delta(container.bounding_box().min.y, 17.2, 0.2);
	assert.in_delta(container.bounding_box().max.y, 18.8, 0.2);

	mapbox_tile1.p.type.set(1); // satelite
	await mapbox_tile1.request_container();
	container = await height_map1.request_container();
	assert.equal(container.bounding_box().min.x, -0.5);
	assert.equal(container.bounding_box().max.x, 0.5);
	assert.equal(container.bounding_box().min.z, -0.5);
	assert.equal(container.bounding_box().max.z, 0.5);
	assert.in_delta(container.bounding_box().min.y, 9.4, 0.1);
	assert.in_delta(container.bounding_box().max.y, 21.5, 0.1);
});
