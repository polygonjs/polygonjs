import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/Vector3AngleTo', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const vector3_1 = actor1.createNode('vector3');
	const vector3_2 = actor1.createNode('vector3');
	const vector3AngleTo1 = actor1.createNode('vector3AngleTo');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput(0, vector3AngleTo1);
	vector3AngleTo1.setInput(0, vector3_1);
	vector3AngleTo1.setInput(1, vector3_2);

	vector3_1.p.Vector3.set([1, 2, 3]);
	vector3_2.p.Vector3.set([0, -1, 2]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

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
