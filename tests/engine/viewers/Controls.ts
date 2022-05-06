import {CoreSleep} from '../../../src/core/Sleep';
import {RendererUtils} from '../../helpers/RendererUtils';

QUnit.test('viewer controls are updated as expected', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	const cameraNode = window.perspective_camera1;
	const events = scene.root().createNode('eventsNetwork');
	const camera_orbit_controls1 = events.createNode('cameraOrbitControls');
	const camera_orbit_controls2 = events.createNode('cameraOrbitControls');

	camera_orbit_controls1.p.tdamping.set(1);
	camera_orbit_controls2.p.tdamping.set(0);
	let id1: string | undefined;
	let id2: string | undefined;
	let id3: string | undefined;

	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		// no controls initially
		CoreSleep.sleep(100);
		assert.ok(!viewer.controlsController().controls());
	});
	cameraNode.p.controls.setNode(camera_orbit_controls1);
	await cameraNode.compute();
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		// set controls to the first camera_orbit_controls
		await CoreSleep.sleep(100);
		assert.ok(viewer.controlsController().controls());
		id1 = viewer.controlsController().controls()?.name;
		assert.ok(id1);
	});

	// change control node
	cameraNode.p.controls.setNode(camera_orbit_controls2);
	await cameraNode.compute();
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		await CoreSleep.sleep(100);
		assert.ok(viewer.controlsController().controls());
		id2 = viewer.controlsController().controls()?.name;
		assert.ok(id2);
		assert.notEqual(id1, id2);
	});

	// update the currently use control node
	camera_orbit_controls2.p.tdamping.set(1);
	await cameraNode.compute();
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		await CoreSleep.sleep(100);
		assert.ok(viewer.controlsController().controls());
		id3 = viewer.controlsController().controls()?.name;
		assert.ok(id3, 'id3 ok');
		assert.notEqual(id1, id3);
		assert.notEqual(id2, id3);
	});

	// remove controls path
	cameraNode.p.controls.set('');
	await cameraNode.compute();
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		await CoreSleep.sleep(100);
		assert.ok(!viewer.controlsController().controls(), 'no controls');
	});
});
