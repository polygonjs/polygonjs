import {CoreSleep} from '../../../../src/core/Sleep';
import {TwoWaySwitchActorNodeInputName} from '../../../../src/engine/nodes/actor/TwoWaySwitch';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/rayIntersectsBox', async (assert) => {
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
	const rayIntersectsBox1 = actor1.createNode('rayIntersectsBox');
	const box3_1 = actor1.createNode('box3');
	const ray1 = actor1.createNode('ray');
	const twoWaySwitch1 = actor1.createNode('twoWaySwitch');
	const constant1 = actor1.createNode('constant');
	const constant2 = actor1.createNode('constant');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onTick);
	setObjectPosition1.setInput('position', twoWaySwitch1);
	rayIntersectsBox1.setInput(ActorConnectionPointType.RAY, ray1);
	rayIntersectsBox1.setInput(ActorConnectionPointType.BOX3, box3_1);
	twoWaySwitch1.setInput(TwoWaySwitchActorNodeInputName.CONDITION, rayIntersectsBox1);
	twoWaySwitch1.setInput(TwoWaySwitchActorNodeInputName.IF_TRUE, constant1);
	twoWaySwitch1.setInput(TwoWaySwitchActorNodeInputName.IF_FALSE, constant2);

	constant1.setConstantType(ActorConnectionPointType.VECTOR3);
	constant2.setConstantType(ActorConnectionPointType.VECTOR3);
	constant1.p.vector3.set([0, 0, 1]);
	constant2.p.vector3.set([0, 0, -1]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

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
	});
});
