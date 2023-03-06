import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/NearestPosition', async (assert) => {
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
	const nearestPosition1 = actor1.createNode('nearestPosition');
	const elementsToArray1 = actor1.createNode('elementsToArray');
	const constant0 = actor1.createNode('constant');
	const constant1 = actor1.createNode('constant');
	const constant2 = actor1.createNode('constant');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', nearestPosition1);
	nearestPosition1.setInput(ActorConnectionPointType.VECTOR3_ARRAY, elementsToArray1);

	const constants = [constant0, constant1, constant2];
	for (let i = 0; i < constants.length; i++) {
		const constant = constants[i];
		constant.setConstantType(ActorConnectionPointType.VECTOR3);
		elementsToArray1.setInput(i, constant);
	}
	constant0.p.vector3.set([1, 2, 3]);
	constant1.p.vector3.set([4, 5, -1]);
	constant2.p.vector3.set([5, 2, 1]);
	nearestPosition1.p.Vector3.set([4, 5, 0]);

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
		assert.deepEqual(object.position.toArray(), [4, 5, -1]);

		// check that we do not get 0,0,0 in the input array
		nearestPosition1.p.Vector3.set([0, 0, 0]);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [1, 2, 3]);
	});
});
