import {Mesh} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/min', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribCreate2 = geo1.createNode('attribCreate');

	attribCreate1.setInput(0, box1);
	attribCreate2.setInput(0, attribCreate1);

	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('a');
	attribCreate1.p.value1.set(-1);

	attribCreate2.setAttribClass(AttribClass.OBJECT);
	attribCreate2.p.name.set('b');
	attribCreate2.p.value1.set(1);

	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, attribCreate2);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const getObjectAttribute2 = actor1.createNode('getObjectAttribute');
	const min = actor1.createNode('min');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	getObjectAttribute1.p.attribName.set('a');
	getObjectAttribute2.p.attribName.set('b');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', min);

	min.setInput(0, getObjectAttribute1);
	min.setInput(1, getObjectAttribute2);

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
		assert.equal(object.position.y, -1, 'object moved to -1');
	});
});

QUnit.test('actor/min for more than 2 inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	const attribCreate2 = geo1.createNode('attribCreate');
	const attribCreate3 = geo1.createNode('attribCreate');
	const attribCreate4 = geo1.createNode('attribCreate');

	attribCreate1.setInput(0, box1);
	attribCreate2.setInput(0, attribCreate1);
	attribCreate3.setInput(0, attribCreate2);
	attribCreate4.setInput(0, attribCreate3);

	const attribCreates = [attribCreate1, attribCreate2, attribCreate3, attribCreate4];
	function attribName(index: number) {
		return `attr${index}`;
	}
	let i = 0;
	for (let attribCreate of attribCreates) {
		attribCreate.setAttribClass(AttribClass.OBJECT);
		attribCreate.p.name.set(attribName(i));
		attribCreate.p.value1.set(-1 * i);
		i++;
	}

	// geo1
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, attribCreate4);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const getObjectAttribute2 = actor1.createNode('getObjectAttribute');
	const getObjectAttribute3 = actor1.createNode('getObjectAttribute');
	const getObjectAttribute4 = actor1.createNode('getObjectAttribute');
	const min = actor1.createNode('min');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	const getObjectAttributes = [getObjectAttribute1, getObjectAttribute2, getObjectAttribute3, getObjectAttribute4];
	let j = 0;
	for (let getObjectAttribute of getObjectAttributes) {
		getObjectAttribute.p.attribName.set(attribName(j));
		j++;
	}

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', min);

	min.setInput(0, getObjectAttribute1);
	min.setInput(1, getObjectAttribute2);
	min.setInput(2, getObjectAttribute3);
	min.setInput(3, getObjectAttribute4);

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
		assert.equal(object.position.y, -3, 'object moved to -3');
	});
});
