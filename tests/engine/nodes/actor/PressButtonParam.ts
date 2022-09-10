import {IntegerParam} from './../../../../src/engine/params/Integer';
import {CoreSleep} from '../../../../src/core/Sleep';
import {SetParamActorNode} from '../../../../src/engine/nodes/actor/SetParam';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/pressButtonParam', async (assert) => {
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
	setParam1.p.param.setParam(checkedParam);
	setParam1.setParamType(ActorConnectionPointType.INTEGER);
	(setParam1.params.get(SetParamActorNode.INPUT_NAME_VAL)! as IntegerParam).set(2);
	setParam1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger2);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const pressButtonParam1 = actor1.createNode('pressButtonParam');

	pressButtonParam1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	pressButtonParam1.p.param.setParam(onManualTrigger2.p.trigger);

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
