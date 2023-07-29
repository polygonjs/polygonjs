import type {QUnit} from '../../../helpers/QUnit';
import {TransformTargetType} from './../../../../src/core/Transform';
import {AttribClass} from './../../../../src/core/geometry/Constant';
import {Mesh} from 'three';
// import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsNegate(qUnit: QUnit) {

qUnit.test('js/negate with float inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const negate = actor1.createNode('negate');
	const constant1 = actor1.createNode('constant');
	const floatToVec3_1 = actor1.createNode('floatToVec3');

	constant1.setJsType(JsConnectionPointType.FLOAT);
	constant1.p.float.set(3);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', floatToVec3_1);
	floatToVec3_1.setInput('y', negate);

	negate.setInput(0, constant1);

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
		assert.equal(object.position.y, -3, 'object moved');
	});
});

qUnit.test('js/negate with vector inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const negate = actor1.createNode('negate');
	const constant1 = actor1.createNode('constant');

	constant1.setJsType(JsConnectionPointType.VECTOR3);
	constant1.p.vector3.set([7, 17, 27]);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', negate);

	negate.setInput(0, constant1);

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
		assert.equal(object.position.x, -7, 'object moved ');
		assert.equal(object.position.y, -17, 'object moved ');
		assert.equal(object.position.z, -27, 'object moved ');
	});
});

qUnit.test('js/negate with vector from attrib to pos', async (assert) => {
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
	attribCreate1.p.value3.set([-1, -2, -3]);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const negate1 = actor1.createNode('negate');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	getObjectAttribute1.setAttribType(JsConnectionPointType.VECTOR3);
	getObjectAttribute1.setAttribName('restP');
	negate1.setInput(0, getObjectAttribute1);
	setObjectPosition1.setInput('position', negate1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);

	await CoreSleep.sleep(50);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	function assertResPUnchanged() {
		assert.deepEqual(object.userData.attributes.restP.toArray(), [-1, -2, -3], 'restP as expected');
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
		assert.deepEqual(object.position.toArray(), [1, 2, 3], 'object moved again');
	});
});

qUnit.test('js/negate with vector from attrib to pos 2', async (assert) => {
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
	attribCreate1.p.value3.set([-1, -2, -3]);
	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.p.t.set([-5, -6, -7]);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const negate1 = actor1.createNode('negate');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	getObjectAttribute1.setAttribType(JsConnectionPointType.VECTOR3);
	getObjectAttribute1.setAttribName('restP');
	negate1.setInput(0, getObjectProperty1, 'position');
	setObjectPosition1.setInput('position', negate1);
	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	await CoreSleep.sleep(50);

	await CoreSleep.sleep(50);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	function assertResPUnchanged() {
		assert.deepEqual(object.userData.attributes.restP.toArray(), [-1, -2, -3], 'restP as expected');
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
		assert.deepEqual(object.position.toArray(), [5, 6, 7], 'object moved');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [-5, -6, -7], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [5, 6, 7], 'object moved again');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assertResPUnchanged();
		assert.deepEqual(object.position.toArray(), [-5, -6, -7], 'object moved again');
	});
});

}