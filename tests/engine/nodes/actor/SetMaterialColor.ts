import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/setMaterialColor', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');

	const meshBasic1 = MAT.createNode('meshBasic');
	const material = meshBasic1.material;

	material1.p.material.setNode(meshBasic1);
	material1.setInput(0, box1);
	actor1.setInput(0, material1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setMaterialColor1 = actor1.createNode('setMaterialColor');

	setMaterialColor1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setMaterialColor1.p.color.set([0.2, 0.3, 0.4]);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(material.color.r, 1);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(material.color.r, 1, 'color unchanged');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(material.color.r, 0.2, 'color changed');
	});
});
