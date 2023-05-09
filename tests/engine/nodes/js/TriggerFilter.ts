import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/triggerFilter', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setViewer1 = actor1.createNode('setViewer');
	const triggerFilter1 = actor1.createNode('triggerFilter');

	triggerFilter1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setViewer1.setInput(JsConnectionPointType.TRIGGER, triggerFilter1);

	await actor1.compute();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);
		assert.notOk(canvas.classList.contains('active'));

		triggerFilter1.p.condition.set(0);
		await CoreSleep.sleep(100);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.notOk(canvas.classList.contains('active'));

		triggerFilter1.p.condition.set(1);
		await CoreSleep.sleep(100);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.ok(canvas.classList.contains('active'));
	});
});
