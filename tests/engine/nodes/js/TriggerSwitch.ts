import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {IntegerParam} from '../../../../src/engine/params/Integer';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsTriggerSwitch(qUnit: QUnit) {
	qUnit.test('js/triggerSwitch', async (assert) => {
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
		const setObjectPosition3 = actor1.createNode('setObjectPosition');
		const triggerSwitch1 = actor1.createNode('triggerSwitch');
		const param1 = actor1.createNode('param');

		triggerSwitch1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
		triggerSwitch1.setInput(triggerSwitch1.p.index.name(), param1);
		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, triggerSwitch1, 0);
		setObjectPosition2.setInput(JsConnectionPointType.TRIGGER, triggerSwitch1, 1);
		setObjectPosition3.setInput(JsConnectionPointType.TRIGGER, triggerSwitch1, 2);

		param1.setJsType(JsConnectionPointType.INT);
		param1.p.name.set('input');
		setObjectPosition1.p.position.set([1, 0, 0]);
		setObjectPosition2.p.position.set([0, 1, 0]);
		setObjectPosition3.p.position.set([0, 0, 1]);

		const container = await actor1.compute();
		const object = container.coreContent()?.threejsObjects()[0]!;
		assert.ok(object, 'object ok');

		const inputParam = actor1.params.get('input')! as IntegerParam;
		assert.ok(inputParam, 'inputParam ok');

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			const {viewer} = args;
			const canvas = viewer.canvas();
			scene.play();
			assert.equal(scene.time(), 0);
			assert.notOk(canvas.classList.contains('active'));

			inputParam.set(0);
			await CoreSleep.sleep(50);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(50);
			assert.deepEqual(object.position.toArray(), [1, 0, 0], 'position is correct 1');

			inputParam.set(1);
			await CoreSleep.sleep(50);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(50);
			assert.deepEqual(object.position.toArray(), [0, 1, 0], 'position is correct 2');

			inputParam.set(2);
			await CoreSleep.sleep(50);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(50);
			assert.deepEqual(object.position.toArray(), [0, 0, 1], 'position is correct 2');

			// we do another pass
			inputParam.set(0);
			await CoreSleep.sleep(50);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(50);
			assert.deepEqual(object.position.toArray(), [1, 0, 0], 'position is correct 1');

			inputParam.set(1);
			await CoreSleep.sleep(50);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(50);
			assert.deepEqual(object.position.toArray(), [0, 1, 0], 'position is correct 2');

			inputParam.set(2);
			await CoreSleep.sleep(50);
			onManualTrigger1.p.trigger.pressButton();
			await CoreSleep.sleep(50);
			assert.deepEqual(object.position.toArray(), [0, 0, 1], 'position is correct 2');
		});
	});
}
