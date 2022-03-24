import {Mesh} from 'three/src/objects/Mesh';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three/src/math/Quaternion';

QUnit.test('actor/setObjectRotation', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onEventManualTrigger1 = actor1.createNode('onEventManualTrigger');
	const setObjectRotation1 = actor1.createNode('setObjectRotation');

	setObjectRotation1.setInput(ActorConnectionPointType.TRIGGER, onEventManualTrigger1);
	setObjectRotation1.p.rotation.set([0, 1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;
	const quat0 = new Quaternion();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.quaternion.angleTo(quat0), 0);

		onEventManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.in_delta(object.quaternion.angleTo(quat0), 1, 0.05);
	});
});
