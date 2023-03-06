import {PerspectiveCamera} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/setPerspectiveCameraFov', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const perspectiveCamera1 = geo1.createNode('perspectiveCamera');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, perspectiveCamera1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setPerspectiveCameraFov1 = actor1.createNode('setPerspectiveCameraFov');

	setPerspectiveCameraFov1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setPerspectiveCameraFov1.p.fov.set(20);

	const container = await actor1.compute();
	const camera = container.coreContent()!.threejsObjects()[0] as PerspectiveCamera;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(camera.fov, 50);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(camera.fov, 50);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(camera.fov, 20);
	});
});
