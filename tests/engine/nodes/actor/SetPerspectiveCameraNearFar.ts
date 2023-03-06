import {PerspectiveCamera} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/setPerspectiveCameraNearFar', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const perspectiveCamera1 = geo1.createNode('perspectiveCamera');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, perspectiveCamera1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setPerspectiveCameraNearFar1 = actor1.createNode('setPerspectiveCameraNearFar');

	setPerspectiveCameraNearFar1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setPerspectiveCameraNearFar1.p.near.set(20);
	setPerspectiveCameraNearFar1.p.far.set(30);

	const container = await actor1.compute();
	const camera = container.coreContent()!.threejsObjects()[0] as PerspectiveCamera;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(camera.near, 0.1);
		assert.equal(camera.far, 100);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(camera.near, 0.1);
		assert.equal(camera.far, 100);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(camera.near, 20);
		assert.equal(camera.far, 30);
	});
});
