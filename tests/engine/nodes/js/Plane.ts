import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/Plane simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const plane = actor1.createNode('plane');
	const getPlaneProperty = actor1.createNode('getPlaneProperty');
	const floatToVec3 = actor1.createNode('floatToVec3');
	const setObjectPosition = actor1.createNode('setObjectPosition');
	const onManualTrigger = actor1.createNode('onManualTrigger');

	getPlaneProperty.setInput(0, plane);
	setObjectPosition.setInput(JsConnectionPointType.TRIGGER, onManualTrigger);
	setObjectPosition.setInput('position', getPlaneProperty, 'normal');
	floatToVec3.setInput('y', getPlaneProperty, 'constant');

	plane.p.normal.set([-2, -3, -4]);
	plane.p.constant.set(7);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 0);
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, -3);
		setObjectPosition.setInput('position', floatToVec3);
		await CoreSleep.sleep(60);
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(60);
		assert.equal(object.position.y, 7);
	});
});
