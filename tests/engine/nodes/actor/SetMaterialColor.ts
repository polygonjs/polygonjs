import {Mesh} from 'three/src/objects/Mesh';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/setMaterialColor', async (assert) => {
	const MAT = window.MAT;
	const meshBasic1 = MAT.createNode('meshBasic');
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');

	material1.setInput(0, box1);
	actor1.setInput(0, material1);
	actor1.flags.display.set(true);

	material1.p.material.setNode(meshBasic1);

	const onEventManualTrigger1 = actor1.createNode('onEventManualTrigger');
	const setMaterialColor1 = actor1.createNode('setMaterialColor');

	setMaterialColor1.setInput(ActorConnectionPointType.TRIGGER, onEventManualTrigger1);
	setMaterialColor1.p.color.set([0, 1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(meshBasic1.material.color.toArray(), [1, 1, 1], 'color is default');

		onEventManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.deepEqual(meshBasic1.material.color.toArray(), [0, 1, 0], 'color has been updated');
	});
});
