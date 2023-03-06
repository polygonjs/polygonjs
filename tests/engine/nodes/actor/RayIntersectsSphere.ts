import {CoreSleep} from '../../../../src/core/Sleep';
import {TwoWaySwitchActorNodeInputName} from '../../../../src/engine/nodes/actor/TwoWaySwitch';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/rayIntersectsSphere', async (assert) => {
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
	const rayIntersectsSphere1 = actor1.createNode('rayIntersectsSphere');
	const sphere1 = actor1.createNode('sphere');
	const ray1 = actor1.createNode('ray');
	const twoWaySwitch1 = actor1.createNode('twoWaySwitch');
	const constant1 = actor1.createNode('constant');
	const constant2 = actor1.createNode('constant');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onTick);
	setObjectPosition1.setInput('position', twoWaySwitch1);
	rayIntersectsSphere1.setInput(ActorConnectionPointType.RAY, ray1);
	rayIntersectsSphere1.setInput(ActorConnectionPointType.SPHERE, sphere1);
	twoWaySwitch1.setInput(TwoWaySwitchActorNodeInputName.CONDITION, rayIntersectsSphere1);
	twoWaySwitch1.setInput(TwoWaySwitchActorNodeInputName.IF_TRUE, constant1);
	twoWaySwitch1.setInput(TwoWaySwitchActorNodeInputName.IF_FALSE, constant2);
	sphere1.p.center.set([0, 0, 0]);
	sphere1.p.radius.set(1);

	constant1.setConstantType(ActorConnectionPointType.VECTOR3);
	constant2.setConstantType(ActorConnectionPointType.VECTOR3);
	constant1.p.vector3.set([0, 0, 1]);
	constant2.p.vector3.set([0, 0, -1]);

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

		ray1.p.origin.set([0, 0, -5]);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, 1], 'pos set');

		ray1.p.origin.set([0, -5, -5]);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, -1], 'pos set');

		ray1.p.origin.set([0, 0, -5]);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, 1], 'pos set');

		sphere1.p.radius.set(2);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, 1], 'pos set');

		sphere1.p.center.set([0, -10, 0]);
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, -1], 'pos set');
	});
});
