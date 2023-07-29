import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsSetObjectMatrixAutoUpdate(qUnit: QUnit) {

qUnit.test('js/setObjectMatrixAutoUpdate', async (assert) => {
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
	const setObjectMatrixAutoUpdate1 = actor1.createNode('setObjectMatrixAutoUpdate');

	setObjectMatrixAutoUpdate1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectMatrixAutoUpdate1.setInput('matrixAutoUpdate', negate1);
	negate1.setInput(0, getObjectProperty1, 'matrixAutoUpdate');

	await CoreSleep.sleep(50);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	object.matrixAutoUpdate = true;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.ok(object.matrixAutoUpdate, 'object matrixAutoUpdate 1');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.notOk(object.matrixAutoUpdate, 'object hidden 2');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.ok(object.matrixAutoUpdate, 'object matrixAutoUpdate 3');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.notOk(object.matrixAutoUpdate, 'object hidden 4');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.ok(object.matrixAutoUpdate, 'object matrixAutoUpdate 5');
	});
});

}