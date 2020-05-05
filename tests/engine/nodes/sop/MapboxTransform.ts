QUnit.test('mapbox_transform simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const mapbox_camera1 = scene.root.create_node('mapbox_camera');
	const add1 = geo1.create_node('add');
	const transform1 = geo1.create_node('transform');
	transform1.p.t.set([-0.07956000001661323, 0, 51.514600000018646]);
	const mapbox_transform1 = geo1.create_node('mapbox_transform');
	transform1.set_input(0, add1);
	mapbox_transform1.set_input(0, transform1);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = mapbox_camera1.create_viewer(element);

	await viewer.wait_for_map_loaded();
	let container = await mapbox_transform1.request_container();
	let center = container.center();
	assert.in_delta(center.x, 0, 0.01);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, 0.09, 0.01);

	// change the position in world space and check it's updated correctly in mapbox space
	transform1.p.t.set([-0.07956000001661323, 0, 51.8]);
	container = await mapbox_transform1.request_container();
	center = container.center();
	assert.in_delta(center.x, 0, 0.01);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, -23000, 1000);

	transform1.p.t.set([-0.1, 0, 51.8]);
	container = await mapbox_transform1.request_container();
	center = container.center();
	assert.in_delta(center.x, -1050, 100);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, -23000, 1000);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
