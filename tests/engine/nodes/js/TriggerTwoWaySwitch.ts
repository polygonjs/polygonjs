import {CoreSleep} from '../../../../src/core/Sleep';
import {BooleanParam} from '../../../../src/engine/params/Boolean';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/triggerTwoWaySwitch', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const setObjectPosition2 = actor1.createNode('setObjectPosition');
	const triggerTwoWaySwitch1 = actor1.createNode('triggerTwoWaySwitch');
	const param1 = actor1.createNode('param');

	triggerTwoWaySwitch1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	triggerTwoWaySwitch1.setInput(triggerTwoWaySwitch1.p.condition.name(), param1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, triggerTwoWaySwitch1, 0);
	setObjectPosition2.setInput(JsConnectionPointType.TRIGGER, triggerTwoWaySwitch1, 1);

	param1.setJsType(JsConnectionPointType.BOOLEAN);
	param1.p.name.set('toggle');
	setObjectPosition1.p.position.set([1, 0, 0]);
	setObjectPosition2.p.position.set([0, 1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()?.threejsObjects()[0]!;
	assert.ok(object, 'object ok');

	const toggleParam = actor1.params.get('toggle')! as BooleanParam;
	assert.ok(toggleParam, 'toggleParam ok');

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);
		assert.notOk(canvas.classList.contains('active'));

		toggleParam.set(0);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [1, 0, 0], 'position is correct');

		toggleParam.set(1);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 1, 0], 'position is correct');

		toggleParam.set(0);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [1, 0, 0], 'position is correct');

		toggleParam.set(1);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.deepEqual(object.position.toArray(), [0, 1, 0], 'position is correct');
	});
});
