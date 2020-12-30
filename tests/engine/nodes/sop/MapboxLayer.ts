import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('mapbox_layer simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const mapbox_camera1 = scene.root.createNode('mapboxCamera');
	const mapbox_layer1 = geo1.createNode('mapboxLayer');
	// await CoreSleep.sleep(200);
	mapbox_layer1.flags.display.set(true);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = mapbox_camera1.createViewer(element);

	await viewer.wait_for_map_loaded();
	// await CoreSleep.sleep(5000);
	let container = await mapbox_layer1.request_container();
	await CoreSleep.sleep(100);
	const core_group = container.core_content();
	assert.ok(core_group, 'core_group exists');
	assert.in_delta(core_group!.objects().length, 50, 30);
	assert.in_delta(core_group!.points_count(), 350, 150);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
