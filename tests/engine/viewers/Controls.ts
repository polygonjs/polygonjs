import {CoreSleep} from '../../../src/core/Sleep';

QUnit.test('viewer controls are updated as expected', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	const perspective_camera1 = window.perspective_camera1;
	const events = scene.root.createNode('events');
	const camera_orbit_controls1 = events.createNode('cameraOrbitControls');
	const camera_orbit_controls2 = events.createNode('cameraOrbitControls');

	camera_orbit_controls1.p.tdamping.set(1);
	camera_orbit_controls2.p.tdamping.set(0);

	const element = document.createElement('div');
	document.body.appendChild(element);
	const viewer = perspective_camera1.createViewer(element);
	// await viewer.cameras_controller.set_camera_node(perspective_camera1);

	// no controls initially
	CoreSleep.sleep(100);
	assert.ok(!viewer.controlsController.controls());

	// set controls to the first camera_orbit_controls
	perspective_camera1.p.controls.set(camera_orbit_controls1.fullPath());
	await CoreSleep.sleep(100);
	assert.ok(viewer.controlsController.controls());
	const id1 = viewer.controlsController.controls()?.name;
	assert.ok(id1);

	// change control node
	perspective_camera1.p.controls.set(camera_orbit_controls2.fullPath());
	await CoreSleep.sleep(100);
	assert.ok(viewer.controlsController.controls());
	const id2 = viewer.controlsController.controls()?.name;
	assert.ok(id2);
	assert.notEqual(id1, id2);

	// update the currently use control node
	camera_orbit_controls2.p.tdamping.set(1);
	await CoreSleep.sleep(100);
	assert.ok(viewer.controlsController.controls());
	const id3 = viewer.controlsController.controls()?.name;
	assert.ok(id3);
	assert.notEqual(id1, id3);
	assert.notEqual(id2, id3);

	// remove controls path
	perspective_camera1.p.controls.set('');
	await CoreSleep.sleep(100);
	assert.ok(!viewer.controlsController.controls());

	viewer.dispose();
	document.body.removeChild(element);
});
