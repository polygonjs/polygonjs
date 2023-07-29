import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsAdd(qUnit: QUnit) {

qUnit.test('js/add for more than 2 inputs float', async (assert) => {
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
	const getObjectAttribute3 = actor1.createNode('getObjectAttribute');
	const getObjectAttribute4 = actor1.createNode('getObjectAttribute');
	const add = actor1.createNode('add');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	const getObjectAttributes = [getObjectAttribute1, getObjectAttribute2, getObjectAttribute3, getObjectAttribute4];
	let j = 0;
	for (let getObjectAttribute of getObjectAttributes) {
		getObjectAttribute.setAttribName(attribName(j));
		j++;
	}

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', add);

	add.setInput(0, getObjectAttribute1);
	add.setInput(1, getObjectAttribute2);
	add.setInput(2, getObjectAttribute3);
	add.setInput(3, getObjectAttribute4);

	assert.notOk(add.params.get('add4')!.states.error.active());

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

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
		assert.equal(object.position.y, 12, 'object moved to 12');
	});
});

qUnit.test('js/add with 2 inputs float', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const add1 = actor1.createNode('add');
	const vec3ToFloat1 = actor1.createNode('vec3ToFloat');
	const floatToVec3_1 = actor1.createNode('floatToVec3');
	const constant1 = actor1.createNode('constant');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	constant1.setJsType(JsConnectionPointType.FLOAT);
	constant1.p.float.set(1);
	vec3ToFloat1.setInput(0, getObjectProperty1, 'position');
	add1.setInput(0, vec3ToFloat1, 'x');
	add1.setInput(1, constant1);
	floatToVec3_1.setInput('y', add1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);
	// assert.notOk(add1.params.get('add2'));

	await CoreSleep.sleep(50);
	assert.ok(add1.params.get('add2'));
	assert.equal(add1.params.get('add2')!.type(), ParamType.FLOAT);
	assert.notOk(add1.params.get('add2')!.states.error.active());
	assert.deepEqual(add1.params.get('add2')?.valueSerialized(), 0);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 1, 'object moved');
	});
});

qUnit.test('js/add with 2 inputs vector', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const add1 = actor1.createNode('add');
	const constant1 = actor1.createNode('constant');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	constant1.setJsType(JsConnectionPointType.VECTOR3);
	constant1.p.vector3.set([1, 2, 3]);
	add1.setInput(0, getObjectProperty1, 'position');
	add1.setInput(1, constant1);
	setObjectPosition1.setInput('position', add1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);
	// assert.notOk(add1.params.get('add2'));

	await CoreSleep.sleep(50);
	assert.ok(add1.params.get('add2'));
	assert.equal(add1.params.get('add2')!.type(), ParamType.VECTOR3);
	assert.notOk(add1.params.get('add2')!.states.error.active());
	assert.deepEqual(add1.params.get('add2')?.valueSerialized(), [0, 0, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [1, 2, 3], 'object moved to 12');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [2, 4, 6], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [3, 6, 9], 'object moved again');
	});
});

qUnit.test('js/add with 2 inputs vector from attrib to pos', async (assert) => {
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
	const add1 = actor1.createNode('add');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	getObjectAttribute1.setAttribType(JsConnectionPointType.VECTOR3);
	getObjectAttribute1.setAttribName('restP');
	add1.setInput(0, getObjectAttribute1);
	add1.setInput(1, getObjectProperty1, 'position');
	setObjectPosition1.setInput('position', add1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);
	// assert.notOk(add1.params.get('add2'));

	await CoreSleep.sleep(50);
	assert.ok(add1.params.get('add2'));
	assert.equal(add1.params.get('add2')!.type(), ParamType.VECTOR3);
	assert.notOk(add1.params.get('add2')!.states.error.active());
	assert.deepEqual(add1.params.get('add2')?.valueSerialized(), [0, 0, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
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
		assert.deepEqual(object.position.toArray(), [1, 2, 3], 'object moved');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [2, 4, 6], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [3, 6, 9], 'object moved again');
	});
});

}