import {Mesh} from 'three';
// import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/anyTrigger simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const onManualTrigger2 = actor1.createNode('onManualTrigger');
	const anyTrigger1 = actor1.createNode('anyTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const multAdd = actor1.createNode('multAdd');
	const constant1 = actor1.createNode('constant');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	constant1.setConstantType(ActorConnectionPointType.FLOAT);
	constant1.p.float.set(3);

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, anyTrigger1);
	anyTrigger1.setInput(0, onManualTrigger1);
	anyTrigger1.setInput(1, onManualTrigger2);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', multAdd);

	multAdd.setInput(0, constant1);
	multAdd.params.get('preAdd')!.set(1);
	multAdd.params.get('mult')!.set(2);
	multAdd.params.get('postAdd')!.set(-17);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, -9, 'object moved');

		constant1.p.float.set(4);
		onManualTrigger2.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, -7, 'object moved');
	});
});
