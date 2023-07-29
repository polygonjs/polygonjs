import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsRayIntersectObject(qUnit: QUnit) {

qUnit.test('js/rayIntersectObject', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const rayIntersectObject1 = actor1.createNode('rayIntersectObject');
	const getIntersectionProperty1 = actor1.createNode('getIntersectionProperty');
	const ray1 = actor1.createNode('ray');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', getIntersectionProperty1, 'point');
	getIntersectionProperty1.setInput(0, rayIntersectObject1, JsConnectionPointType.INTERSECTION);
	rayIntersectObject1.setInput(JsConnectionPointType.RAY, ray1);
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
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 0.1, -0.5], 'pos set');
		object.position.set(0, 0, 0);
	});
});

}