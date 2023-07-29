import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsSetMaterialEmissiveColor(qUnit: QUnit) {

qUnit.test('js/setMaterialEmissiveColor', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');

	const meshStandard1 = MAT.createNode('meshStandard');
	const material = await meshStandard1.material();

	material1.p.material.setNode(meshStandard1);
	material1.setInput(0, box1);
	actor1.setInput(0, material1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setMaterialColor1 = actor1.createNode('setMaterialEmissiveColor');

	setMaterialColor1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setMaterialColor1.p.color.set([0.2, 0.3, 0.4]);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(material.emissive.r, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(material.emissive.r, 0, 'color unchanged');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(material.emissive.r, 0.2, 'color changed');
	});
});

}