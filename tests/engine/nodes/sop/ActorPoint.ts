import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, Vector3} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ActorPointSopNode} from '../../../../src/engine/nodes/sop/ActorPoint';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {SetPointAttributeInputName} from '../../../../src/engine/nodes/js/SetPointAttribute';
export function testenginenodessopActorPoint(qUnit: QUnit) {

const _center = new Vector3();

function onCreateHookSetPointPosition(node: ActorPointSopNode) {
	const onTick = node.createNode('onTick');
	const setPointPosition = node.createNode('setPointPosition');
	const getPointProperty = node.createNode('getPointProperty');
	const add1 = node.createNode('add');

	setPointPosition.setInput(JsConnectionPointType.TRIGGER, onTick);
	setPointPosition.setInput('position', add1);
	add1.setInput(0, getPointProperty, 'position');
	(add1.params.get('add1')! as Vector3Param).set([0, 0.01, 0]);
}
function onCreateHookSetPointAttributeNumber(node: ActorPointSopNode) {
	const onTick = node.createNode('onTick');
	const setPointAttribute1 = node.createNode('setPointAttribute');
	const getPointProperty = node.createNode('getPointProperty');
	const vec3ToFloat_1 = node.createNode('vec3ToFloat');

	setPointAttribute1.setInput(JsConnectionPointType.TRIGGER, onTick, JsConnectionPointType.TRIGGER);
	setPointAttribute1.setInput(SetPointAttributeInputName.val, vec3ToFloat_1, 'y');
	setPointAttribute1.setAttribName('h');
	vec3ToFloat_1.setInput(0, getPointProperty, 'position');

	return {setPointAttribute1, getPointProperty, vec3ToFloat_1};
}
function onCreateHookSetPointAttributeNumberWithConstantForAttribName(node: ActorPointSopNode) {
	const {setPointAttribute1} = onCreateHookSetPointAttributeNumber(node);

	const constant1 = node.createNode('constant');
	constant1.setJsType(JsConnectionPointType.STRING);
	constant1.p.string.set('h');
	setPointAttribute1.setInput(SetPointAttributeInputName.attribName, constant1);
}
function onCreateHookSetPointAttributeVector2(node: ActorPointSopNode) {
	const onTick = node.createNode('onTick');
	const setPointAttribute1 = node.createNode('setPointAttribute');
	const getPointProperty = node.createNode('getPointProperty');
	const vec3ToVec2_1 = node.createNode('vec3ToVec2');

	setPointAttribute1.setInput(JsConnectionPointType.TRIGGER, onTick, JsConnectionPointType.TRIGGER);
	setPointAttribute1.setInput(SetPointAttributeInputName.val, vec3ToVec2_1);
	setPointAttribute1.setAttribName('h');
	setPointAttribute1.setAttribType(JsConnectionPointType.VECTOR2);
	vec3ToVec2_1.setInput(0, getPointProperty, 'position');

	return {setPointAttribute1, getPointProperty, vec3ToVec2_1};
}

qUnit.test('sop/actorPoint setPointPosition', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([0, 1, 10]);
	const box1 = geo1.createNode('box');
	const actorPoint1 = geo1.createNode('actorPoint');

	actorPoint1.setInput(0, box1);
	actorPoint1.flags.display.set(true);
	onCreateHookSetPointPosition(actorPoint1);

	const container = await actorPoint1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);

	const _getGeometryBoundingBoxCenterY = () => {
		object.geometry.computeBoundingBox();
		object.geometry.boundingBox!.getCenter(_center);
		return _center.y;
	};

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(_getGeometryBoundingBoxCenterY(), 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.more_than(_getGeometryBoundingBoxCenterY(), 0.05, 'object moved up');
	});
});

qUnit.test('sop/actorPoint setPointAttributeNumber', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([0, 1, 10]);
	const line1 = geo1.createNode('line');
	const attribCreate1 = geo1.createNode('attribCreate');
	const actorPoint1 = geo1.createNode('actorPoint');

	attribCreate1.setInput(0, line1);
	actorPoint1.setInput(0, attribCreate1);

	const attribName = 'h';
	attribCreate1.p.name.set(attribName);

	onCreateHookSetPointAttributeNumber(actorPoint1);
	actorPoint1.flags.display.set(true);

	const container = await actorPoint1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);

	const _getGeometryAttribNumber = () => {
		const values = object.geometry.getAttribute(attribName).array as number[];
		return [...values];
	};
	assert.deepEqual(_getGeometryAttribNumber(), [0, 0], 'init');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.deepEqual(_getGeometryAttribNumber(), [0, 0], 'not started');
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.deepEqual(_getGeometryAttribNumber(), [0, 1], 'after play');
	});
});

qUnit.test('sop/actorPoint setPointAttributeNumberWithConstant', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([0, 1, 10]);
	const line1 = geo1.createNode('line');
	const attribCreate1 = geo1.createNode('attribCreate');
	const actorPoint1 = geo1.createNode('actorPoint');

	attribCreate1.setInput(0, line1);
	actorPoint1.setInput(0, attribCreate1);

	const attribName = 'h';
	attribCreate1.p.name.set(attribName);

	onCreateHookSetPointAttributeNumberWithConstantForAttribName(actorPoint1);
	actorPoint1.flags.display.set(true);

	const container = await actorPoint1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);

	const _getGeometryAttribNumber = () => {
		const values = object.geometry.getAttribute(attribName).array as number[];
		return [...values];
	};
	assert.deepEqual(_getGeometryAttribNumber(), [0, 0]);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.deepEqual(_getGeometryAttribNumber(), [0, 0]);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.deepEqual(_getGeometryAttribNumber(), [0, 1]);
	});
});

qUnit.test('sop/actorPoint setPointAttributeVector2', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([0, 1, 10]);
	const line1 = geo1.createNode('line');
	const attribCreate1 = geo1.createNode('attribCreate');
	const actorPoint1 = geo1.createNode('actorPoint');

	attribCreate1.setInput(0, line1);
	actorPoint1.setInput(0, attribCreate1);

	const attribName = 'h';
	attribCreate1.p.name.set(attribName);
	attribCreate1.p.size.set(2);

	onCreateHookSetPointAttributeVector2(actorPoint1);
	actorPoint1.flags.display.set(true);

	const container = await actorPoint1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);

	const _getGeometryAttribNumber = () => {
		const values = object.geometry.getAttribute(attribName).array as number[];
		return [...values];
	};
	assert.deepEqual(_getGeometryAttribNumber(), [0, 0, 0, 0], 'init');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.deepEqual(_getGeometryAttribNumber(), [0, 0, 0, 0], 'not started');
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.deepEqual(_getGeometryAttribNumber(), [0, 0, 0, 1], 'after play');
	});
});

}