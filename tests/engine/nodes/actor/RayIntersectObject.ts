import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/rayIntersectObject', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const rayIntersectObject1 = actor1.createNode('rayIntersectObject');
	const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
	const ray1 = actor1.createNode('ray');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', getIntersectionProperty1, 'point');
	getIntersectionProperty1.setInput(0, rayIntersectObject1, ActorConnectionPointType.INTERSECTION);
	rayIntersectObject1.setInput(ActorConnectionPointType.RAY, ray1);
	ray1.p.origin.set([0, 0, -5]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0], 'position 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0, -0.5], 'pos set');
		object.position.set(0, 0, 0);
		object.updateMatrix();

		ray1.p.origin.set([0, 0.1, -5]);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0.1, -1], 'pos set');
		object.position.set(0, 0, 0);
	});
});
