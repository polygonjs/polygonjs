import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/Vector3AngleTo', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const constant1 = actor1.createNode('constant');
	const constant2 = actor1.createNode('constant');
	const vector3AngleTo1 = actor1.createNode('vector3AngleTo');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput(0, vector3AngleTo1);
	vector3AngleTo1.setInput(0, constant1);
	vector3AngleTo1.setInput(1, constant2);

	constant1.setJsType(JsConnectionPointType.VECTOR3);
	constant2.setJsType(JsConnectionPointType.VECTOR3);
	constant1.p.vector3.set([1, 2, 3]);
	constant2.p.vector3.set([0, -1, 2]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.x, 0);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.in_delta(object.position.x, 1.0723, 0.01);
	});
});
