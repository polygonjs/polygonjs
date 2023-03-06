import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/rayFromCamera', async (assert) => {
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
	const rayIntersectBox1 = actor1.createNode('rayIntersectBox');
	const box3_1 = actor1.createNode('box3');
	const getDefaultCamera1 = actor1.createNode('getDefaultCamera');
	const rayFromCamera1 = actor1.createNode('rayFromCamera');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onTick);
	setObjectPosition1.setInput('position', rayIntersectBox1);
	rayIntersectBox1.setInput(ActorConnectionPointType.RAY, rayFromCamera1);
	rayIntersectBox1.setInput(ActorConnectionPointType.BOX3, box3_1);
	rayFromCamera1.setInput(0, getDefaultCamera1);

	rayFromCamera1.p.x.set(0);
	rayFromCamera1.p.y.set(0);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0], 'position 0');

		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, 1], 'pos set');

		rayFromCamera1.p.x.set(0.25);
		rayFromCamera1.p.y.set(0.25);
		await CoreSleep.sleep(50);
		assert.in_delta(object.position.toArray()[0], 0.4663076581, 0.001, 'pos set');
		assert.in_delta(object.position.toArray()[1], 0.4663076581, 0.001, 'pos set');
		assert.in_delta(object.position.toArray()[2], 1, 0.001, 'pos set');
	});
});
