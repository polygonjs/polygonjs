import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('mapbox_plane simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const mapbox_camera1 = scene.root.createNode('mapboxCamera');
	const mapbox_plane1 = geo1.createNode('mapboxPlane');
	// await CoreSleep.sleep(200);
	mapbox_plane1.flags.display.set(true);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = mapbox_camera1.create_viewer(element);

	await viewer.wait_for_map_loaded();
	// await CoreSleep.sleep(5000);
	let container = await mapbox_plane1.request_container();
	await CoreSleep.sleep(100);
	let center = container.center().toArray();
	let bbox = container.bounding_box();
	assert.in_delta(center[0], 0, 0.1);
	assert.in_delta(bbox.min.x, -400, 50);
	assert.in_delta(bbox.max.x, 400, 50);
	assert.in_delta(bbox.min.y, 0, 1);
	assert.in_delta(bbox.max.y, 0, 1);
	assert.in_delta(bbox.min.z, -300, 50);
	assert.in_delta(bbox.max.z, 300, 50);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
