import {IntegerParam} from './../../../../src/engine/params/Integer';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/getParam', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');
	const switch1 = geo1.createNode('switch');
	const checkedParam = switch1.p.input;

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger2 = actor1.createNode('onManualTrigger');
	const setParam1 = actor1.createNode('setParam');
	const getParam1 = actor1.createNode('getParam');
	setParam1.setParamParam(checkedParam);
	setParam1.setParamType(JsConnectionPointType.INT);
	(setParam1.params.get(SetParamJsNodeInputName.val)! as IntegerParam).set(2);
	setParam1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger2);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const pressButtonParam1 = actor1.createNode('pressButtonParam');

	pressButtonParam1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	pressButtonParam1.setInput(JsConnectionPointType.PARAM, getParam1);
	getParam1.p.Param.setParam(onManualTrigger2.p.trigger);

	await actor1.compute();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(checkedParam.value, 0);
		scene.play();
		assert.equal(checkedParam.value, 0);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(checkedParam.value, 2);
	});
});
