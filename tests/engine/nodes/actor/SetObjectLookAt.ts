import {Mesh} from 'three/src/objects/Mesh';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three/src/math/Quaternion';
import {Vector3} from 'three/src/math/Vector3';

QUnit.test('actor/setObjectLookAt', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onEventTick1 = actor1.createNode('onEventTick');
	const setObjectLookAt1 = actor1.createNode('setObjectLookAt');

	setObjectLookAt1.setInput(ActorConnectionPointType.TRIGGER, onEventTick1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);
	const t = new Vector3();
	const s = new Vector3();
	const quat = new Quaternion();
	const quatRef = new Quaternion();

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		object.matrix.decompose(t, quat, s);
		assert.in_delta(quatRef.angleTo(quat), 0, 0.05);

		setObjectLookAt1.p.targetPosition.set([1, 1, 1]);
		await CoreSleep.sleep(200);
		object.matrix.decompose(t, quat, s);
		assert.in_delta(quatRef.angleTo(quat), 0.987, 0.05);

		setObjectLookAt1.p.targetPosition.set([3, 0, 1]);
		await CoreSleep.sleep(200);
		object.matrix.decompose(t, quat, s);
		assert.in_delta(quatRef.angleTo(quat), 1.249, 0.05);
	});
});
