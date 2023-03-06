import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three';

QUnit.test('actor/setObjectPolarTransform', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPolarTransform1 = actor1.createNode('setObjectPolarTransform');

	setObjectPolarTransform1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPolarTransform1.p.depth.set(1);
	setObjectPolarTransform1.p.longitude.set(45);
	setObjectPolarTransform1.p.latitude.set(45);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	const quat0 = new Quaternion();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.quaternion.angleTo(quat0), 0);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.in_delta(object.quaternion.angleTo(quat0), 1.096, 0.05);
		assert.in_delta(object.position.x, 0.5, 0.05);
		assert.in_delta(object.position.y, 0.707, 0.05);
	});
});
