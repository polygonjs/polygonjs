import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/object3DUpdateMatrix', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const objectUpdateMatrix1 = actor1.createNode('object3DUpdateMatrix');

	objectUpdateMatrix1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	object.position.set(1, 2, 3);
	object.matrixAutoUpdate = false;
	assert.deepEqual(object.matrix.elements, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.matrix.elements, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
		object.position.set(4, 5, 6);

		await CoreSleep.sleep(100);
		assert.deepEqual(object.matrix.elements, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.matrix.elements, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1]);
	});
});
