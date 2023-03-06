import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/rayIntersectPlane', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onTick = actor1.createNode('onTick');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const rayIntersectPlane1 = actor1.createNode('rayIntersectPlane');
	const plane1 = actor1.createNode('plane');
	const ray1 = actor1.createNode('ray');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onTick);
	setObjectPosition1.setInput('position', rayIntersectPlane1);
	rayIntersectPlane1.setInput(ActorConnectionPointType.RAY, ray1);
	rayIntersectPlane1.setInput(ActorConnectionPointType.PLANE, plane1);
	plane1.p.normal.set([0, 0, 1]);
	plane1.p.constant.set(1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0], 'position 0');

		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, 0], 'pos set');

		ray1.p.origin.set([0, 0, -5]);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, -1], 'pos set');

		plane1.p.constant.set(5);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, -5], 'pos set');
	});
});
