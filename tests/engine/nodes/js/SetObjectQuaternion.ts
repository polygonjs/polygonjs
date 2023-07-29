import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three';
export function testenginenodesjsSetObjectQuaternion(qUnit: QUnit) {

qUnit.test('js/setObjectQuaternion', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectQuaternion1 = actor1.createNode('setObjectQuaternion');
	const quaternion1 = actor1.createNode('quaternion');

	setObjectQuaternion1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectQuaternion1.setInput(JsConnectionPointType.QUATERNION, quaternion1);
	quaternion1.p.axis.set([0, 1, 0]);
	quaternion1.p.angle.set(0.5 * Math.PI);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	const quat0 = new Quaternion();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.quaternion.angleTo(quat0), 0);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.in_delta(object.quaternion.angleTo(quat0), 1.57, 0.05);
	});
});

}