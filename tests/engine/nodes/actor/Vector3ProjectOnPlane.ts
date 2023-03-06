import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/Vector3ProjectOnPlane', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');
	transform1.setInput(0, box1);
	actor1.setInput(0, transform1);
	actor1.flags.display.set(true);

	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.p.t.set([1, 2, 3]);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const vector3ProjectOnPlane1 = actor1.createNode('vector3ProjectOnPlane');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', vector3ProjectOnPlane1);

	vector3ProjectOnPlane1.p.Vector3.set([6, 4, 2]);
	vector3ProjectOnPlane1.p.planeNormal.set([1, 1, 1]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [1, 2, 3]);

		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [1, 2, 3]);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [2, 0, -2]);
	});
});
