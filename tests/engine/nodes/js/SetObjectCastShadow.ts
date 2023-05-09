import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/setObjectCastShadow', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const negate1 = actor1.createNode('negate');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const setObjectCastShadow1 = actor1.createNode('setObjectCastShadow');

	setObjectCastShadow1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectCastShadow1.setInput('castShadow', negate1);
	negate1.setInput(0, getObjectProperty1, 'castShadow');

	await CoreSleep.sleep(50);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.ok(object.castShadow, 'object castShadow 1');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.notOk(object.castShadow, 'object not castShadow 2');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.ok(object.castShadow, 'object castShadow 3');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.notOk(object.castShadow, 'object not castShadow 4');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.ok(object.castShadow, 'object castShadow 5');
	});
});
