import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {FloatParam} from '../../../../src/engine/params/Float';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/PreviousValue with primitive', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const floatToVec3_1 = actor1.createNode('floatToVec3');
	const param1 = actor1.createNode('param');
	const previousValue1 = actor1.createNode('previousValue');

	param1.setJsType(JsConnectionPointType.FLOAT);
	param1.p.name.set('currentValue');

	previousValue1.setInput(0, param1);
	floatToVec3_1.setInput('y', previousValue1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	const currentValueParam = actor1.params.get('currentValue') as FloatParam;
	assert.ok(currentValueParam);
	assert.equal(currentValueParam.type(), ParamType.FLOAT);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		currentValueParam.set(1);
		await CoreSleep.sleep(200);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0);

		currentValueParam.set(2);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(object.position.y, 2, 'object at 2');

		currentValueParam.set(3);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(object.position.y, 2, 'object still at 2');

		currentValueParam.set(4);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(object.position.y, 3, 'object at 3');

		currentValueParam.set(6);
		await CoreSleep.sleep(200);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(object.position.y, 4, 'object at 4');
	});
});
