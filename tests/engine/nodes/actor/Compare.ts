import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorCompareTestName} from '../../../../src/engine/nodes/actor/Compare';
import {OnTickActorNodeOuput} from '../../../../src/engine/nodes/actor/OnTick';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/compare', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const compare1 = actor1.createNode('compare');
	const twoWaySwitch1 = actor1.createNode('twoWaySwitch');
	const floatToVec3_1 = actor1.createNode('floatToVec3');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	compare1.setInput(0, onTick1, OnTickActorNodeOuput.TIME);
	compare1.setTestName(ActorCompareTestName.GREATER_THAN);
	compare1.params.get('value1')!.set(1);

	twoWaySwitch1.setInput(0, compare1);
	twoWaySwitch1.params.get('ifTrue')!.set(1);

	floatToVec3_1.setInput(1, twoWaySwitch1);

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	setObjectPosition1.setInput('position', floatToVec3_1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);

		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.1, 'time is 0.5');
		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		await CoreSleep.sleep(1000);
		assert.in_delta(scene.time(), 1.5, 0.1, 'time is 1.5');
		assert.deepEqual(object.position.toArray(), [0, 1, 0]);
	});
});
