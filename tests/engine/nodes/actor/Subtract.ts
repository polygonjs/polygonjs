import {Mesh} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/subtract for more than 2 inputs float', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	// geo2
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
		attribCreate.p.value1.set(2 * i);
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
	// const getObjectAttribute3 = actor1.createNode('getObjectAttribute');
	// const getObjectAttribute4 = actor1.createNode('getObjectAttribute');
	const subtract = actor1.createNode('subtract');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	const getObjectAttributes = [getObjectAttribute1, getObjectAttribute2];
	let j = 0;
	for (let getObjectAttribute of getObjectAttributes) {
		getObjectAttribute.p.attribName.set(attribName(j));
		j++;
	}

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', subtract);

	subtract.setInput(0, getObjectAttribute1);
	subtract.setInput(1, getObjectAttribute2);
	// subtract.setInput(2, getObjectAttribute3);
	// subtract.setInput(3, getObjectAttribute4);

	// assert.notOk(subtract.params.get('sub4')!.states.error.active());

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
		assert.equal(object.position.y, -2, 'object moved to 12');
	});
});

QUnit.test('actor/subtract with 2 inputs float', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const subtract1 = actor1.createNode('subtract');
	const vec3ToFloat1 = actor1.createNode('vec3ToFloat');
	const floatToVec3_1 = actor1.createNode('floatToVec3');
	const constant1 = actor1.createNode('constant');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	constant1.setConstantType(ActorConnectionPointType.FLOAT);
	constant1.p.float.set(1);
	vec3ToFloat1.setInput(0, getObjectProperty1, 'position');
	subtract1.setInput(0, vec3ToFloat1, 'x');
	subtract1.setInput(1, constant1);
	floatToVec3_1.setInput('y', subtract1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);

	await CoreSleep.sleep(50);
	assert.notOk(subtract1.params.get('sub2'));
	assert.ok(subtract1.params.get('sub1'));
	assert.equal(subtract1.params.get('sub1')!.type(), ParamType.FLOAT);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, -1, 'object moved');
	});
});

QUnit.test('actor/subtract with 2 inputs vector', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const subtract1 = actor1.createNode('subtract');
	const constant1 = actor1.createNode('constant');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	constant1.setConstantType(ActorConnectionPointType.VECTOR3);
	constant1.p.vector3.set([1, 2, 3]);
	subtract1.setInput(0, getObjectProperty1, 'position');
	subtract1.setInput(1, constant1);
	setObjectPosition1.setInput('position', subtract1);
	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);

	await CoreSleep.sleep(50);
	assert.ok(subtract1.params.get('sub1'));
	assert.equal(subtract1.params.get('sub1')!.type(), ParamType.VECTOR3);
	assert.notOk(subtract1.params.get('sub1')!.states.error.active());
	assert.deepEqual(subtract1.params.get('sub1')?.valueSerialized(), [0, 0, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [-1, -2, -3], 'object moved to 12');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [-2, -4, -6], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [-3, -6, -9], 'object moved again');
	});
});

QUnit.test('actor/subtract with 2 inputs vector from attrib to pos', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	const actor1 = geo1.createNode('actor');

	attribCreate1.setInput(0, box1);
	actor1.setInput(0, attribCreate1);
	actor1.flags.display.set(true);

	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('restP');
	attribCreate1.p.size.set(3);
	attribCreate1.p.value3.set([1, 2, 3]);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const subtract1 = actor1.createNode('subtract');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	getObjectAttribute1.setAttribType(ActorConnectionPointType.VECTOR3);
	getObjectAttribute1.p.attribName.set('restP');
	subtract1.setInput(0, getObjectProperty1, 'position');
	subtract1.setInput(1, getObjectAttribute1);
	setObjectPosition1.setInput('position', subtract1);
	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);

	await CoreSleep.sleep(50);
	assert.notOk(subtract1.params.get('sub2'));
	assert.ok(subtract1.params.get('sub1'));
	assert.equal(subtract1.params.get('sub1')!.type(), ParamType.VECTOR3);
	assert.notOk(subtract1.params.get('sub1')!.states.error.active());
	assert.deepEqual(subtract1.params.get('sub1')?.valueSerialized(), [0, 0, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;
	function assertResPUnchanged() {
		assert.deepEqual(object.userData.attributes.restP.toArray(), [1, 2, 3], 'restP as expected');
	}
	assertResPUnchanged();

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');
		assertResPUnchanged();

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [-1, -2, -3], 'object moved');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [-2, -4, -6], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [-3, -6, -9], 'object moved again');
	});
});

QUnit.test('actor/subtract with 2 inputs vector from attrib to pos 2', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const attribCreate1 = geo1.createNode('attribCreate');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');

	attribCreate1.setInput(0, box1);
	transform1.setInput(0, attribCreate1);
	actor1.setInput(0, transform1);
	actor1.flags.display.set(true);

	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('restP');
	attribCreate1.p.size.set(3);
	attribCreate1.p.value3.set([1, 2, 3]);
	transform1.setApplyOn(TransformTargetType.OBJECTS);
	transform1.p.t.set([-5, -6, -7]);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const subtract1 = actor1.createNode('subtract');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	getObjectAttribute1.setAttribType(ActorConnectionPointType.VECTOR3);
	getObjectAttribute1.p.attribName.set('restP');
	subtract1.setInput(0, getObjectAttribute1);
	subtract1.setInput(1, getObjectProperty1, 'position');
	setObjectPosition1.setInput('position', subtract1);
	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);

	await CoreSleep.sleep(50);
	assert.notOk(subtract1.params.get('sub2'));
	assert.ok(subtract1.params.get('sub1'));
	assert.equal(subtract1.params.get('sub1')!.type(), ParamType.VECTOR3);
	assert.notOk(subtract1.params.get('sub1')!.states.error.active());
	assert.deepEqual(subtract1.params.get('sub1')?.valueSerialized(), [0, 0, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0] as Mesh;
	function assertResPUnchanged() {
		assert.deepEqual(object.userData.attributes.restP.toArray(), [1, 2, 3], 'restP as expected');
	}
	assertResPUnchanged();

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, -6);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, -6, 'object still not moved');
		assertResPUnchanged();

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [6, 8, 10], 'object moved');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [-5, -6, -7], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [6, 8, 10], 'object moved again');
	});
});
