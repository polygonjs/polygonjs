import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ActorInstanceSopNode} from '../../../../src/engine/nodes/sop/ActorInstance';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {SetPointAttributeInputName} from '../../../../src/engine/nodes/js/SetPointAttribute';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {InstanceAttrib} from '../../../../src/core/geometry/Instancer';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
export function testenginenodessopActorInstance(qUnit: QUnit) {
	function onCreateHookSetInstancePosition(node: ActorInstanceSopNode) {
		const onTick = node.createNode('onTick');
		const setInstancePosition = node.createNode('setInstancePosition');
		const getInstanceProperty = node.createNode('getInstanceProperty');
		const add1 = node.createNode('add');

		setInstancePosition.setInput(JsConnectionPointType.TRIGGER, onTick);
		setInstancePosition.setInput('position', add1);
		add1.setInput(0, getInstanceProperty, 'instancePosition');
		(add1.params.get('add1')! as Vector3Param).set([0, 0.01, 0]);
	}
	function onCreateHookSetInstanceQuaternion(node: ActorInstanceSopNode) {
		const onTick = node.createNode('onTick');
		const setInstanceQuaternion = node.createNode('setInstanceQuaternion');
		const quaternion1 = node.createNode('quaternion');

		setInstanceQuaternion.setInput(JsConnectionPointType.TRIGGER, onTick);
		setInstanceQuaternion.setInput(JsConnectionPointType.QUATERNION, quaternion1);

		quaternion1.p.angle.set(0.5 * Math.PI);
	}
	function onCreateHookSetInstanceLookAt(node: ActorInstanceSopNode) {
		const onTick = node.createNode('onTick');
		const setInstanceLookAt = node.createNode('setInstanceLookAt');

		setInstanceLookAt.setInput(JsConnectionPointType.TRIGGER, onTick);

		return {setInstanceLookAt};
	}
	function onCreateHookSetInstanceScale(node: ActorInstanceSopNode) {
		const onTick = node.createNode('onTick');
		const setInstanceScale = node.createNode('setInstanceScale');
		const getInstanceProperty = node.createNode('getInstanceProperty');
		const add1 = node.createNode('add');

		setInstanceScale.setInput(JsConnectionPointType.TRIGGER, onTick);
		setInstanceScale.setInput('scale', add1);
		add1.setInput(0, getInstanceProperty, 'instanceScale');
		(add1.params.get('add1')! as Vector3Param).set([0, 0.01, 0]);
	}
	function onCreateHookSetInstanceAttributeNumber(node: ActorInstanceSopNode) {
		const onTick = node.createNode('onTick');
		const setInstanceAttribute1 = node.createNode('setInstanceAttribute');
		const getInstanceProperty = node.createNode('getInstanceProperty');
		const vec3ToFloat_1 = node.createNode('vec3ToFloat');

		setInstanceAttribute1.setInput(JsConnectionPointType.TRIGGER, onTick, JsConnectionPointType.TRIGGER);
		setInstanceAttribute1.setInput(SetPointAttributeInputName.val, vec3ToFloat_1, 'y');
		setInstanceAttribute1.setAttribName('h');
		vec3ToFloat_1.setInput(0, getInstanceProperty, 'instancePosition');

		return {setInstanceAttribute1, getInstanceProperty, vec3ToFloat_1};
	}
	function onCreateHookSetPointAttributeNumberWithConstantForAttribName(node: ActorInstanceSopNode) {
		const {setInstanceAttribute1, getInstanceProperty, vec3ToFloat_1} =
			onCreateHookSetInstanceAttributeNumber(node);

		const constant1 = node.createNode('constant');
		constant1.setJsType(JsConnectionPointType.STRING);
		constant1.p.string.set('h');
		setInstanceAttribute1.setInput(SetPointAttributeInputName.attribName, constant1);

		return {setInstanceAttribute1, getInstanceProperty, vec3ToFloat_1};
	}
	function onCreateHookSetPointAttributeVector2(node: ActorInstanceSopNode) {
		const onTick = node.createNode('onTick');
		const setInstanceAttribute1 = node.createNode('setInstanceAttribute');
		const getInstanceProperty1 = node.createNode('getInstanceProperty');
		const vec3ToVec2_1 = node.createNode('vec3ToVec2');

		setInstanceAttribute1.setInput(JsConnectionPointType.TRIGGER, onTick, JsConnectionPointType.TRIGGER);
		setInstanceAttribute1.setInput(SetPointAttributeInputName.val, vec3ToVec2_1);
		setInstanceAttribute1.setAttribName('h');
		setInstanceAttribute1.setAttribType(JsConnectionPointType.VECTOR2);
		vec3ToVec2_1.setInput(0, getInstanceProperty1, 'instancePosition');

		return {setInstanceAttribute1, getInstanceProperty1, vec3ToVec2_1};
	}
	function prepareSopNodes(geo: GeoObjNode) {
		const box1 = geo.createNode('box');
		const plane = geo.createNode('plane');
		const instance1 = geo.createNode('instance');
		const MAT = geo.createNode('materialsNetwork');
		const meshBasicBuilder = MAT.createNode('meshBasicBuilder');
		const actorInstance1 = geo.createNode('actorInstance');

		instance1.setInput(0, box1);
		instance1.setInput(1, plane);
		instance1.p.material.setNode(meshBasicBuilder);
		actorInstance1.setInput(0, instance1);

		return {instance1, actorInstance1};
	}

	qUnit.test('sop/actorInstance setInstancePosition', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const {actorInstance1} = prepareSopNodes(geo1);

		onCreateHookSetInstancePosition(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(50);

		const _getGeometryBoundingBoxCenterY = () => {
			const attribute = object.geometry.getAttribute(InstanceAttrib.POSITION);
			if (!attribute) {
				return 0;
			}
			const pointsCount = attribute.count;
			let sum = 0;
			for (let i = 0; i < pointsCount; i++) {
				sum += attribute.getY(i);
			}
			return sum / pointsCount;
		};

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			assert.equal(_getGeometryBoundingBoxCenterY(), 0);
			scene.play();
			assert.equal(scene.time(), 0);
			await CoreSleep.sleep(100);
			assert.more_than(_getGeometryBoundingBoxCenterY(), 0.05, 'object moved up');
		});
	});

	qUnit.test('sop/actorInstance setInstanceQuaternion', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const {actorInstance1} = prepareSopNodes(geo1);

		onCreateHookSetInstanceQuaternion(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(50);

		const _getGeometryQuaternions = (): number[] => {
			const attribute = object.geometry.getAttribute(InstanceAttrib.QUATERNION);
			if (!attribute) {
				return [0];
			}
			return [...(attribute.array as number[])];
		};

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			assert.in_delta(_getGeometryQuaternions()[0], -0.7, 0.1);
			scene.play();
			assert.equal(scene.time(), 0);
			await CoreSleep.sleep(100);
			assert.equal(_getGeometryQuaternions()[0], 0);
		});
	});

	qUnit.test('sop/actorInstance setInstanceLookAt', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const {actorInstance1} = prepareSopNodes(geo1);

		const {setInstanceLookAt} = onCreateHookSetInstanceLookAt(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(50);

		const _getGeometryQuaternions = (): number[] => {
			const attribute = object.geometry.getAttribute(InstanceAttrib.QUATERNION);
			if (!attribute) {
				return [0];
			}
			return [...(attribute.array as number[])];
		};

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			assert.in_delta(_getGeometryQuaternions()[0], -0.7, 0.1);
			scene.play();
			assert.equal(scene.time(), 0);
			await CoreSleep.sleep(100);
			assert.in_delta(_getGeometryQuaternions()[0], 0, 0.01);

			setInstanceLookAt.p.targetPosition.set([0, 1, 1]);
			await CoreSleep.sleep(100);
			assert.in_delta(_getGeometryQuaternions()[0], -0.274, 0.05);
		});
	});

	qUnit.test('sop/actorInstance setInstanceScale', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const {actorInstance1} = prepareSopNodes(geo1);

		onCreateHookSetInstanceScale(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(50);

		const _getGeometryBoundingBoxCenterY = () => {
			const attribute = object.geometry.getAttribute(InstanceAttrib.SCALE);
			if (!attribute) {
				return 0;
			}
			const pointsCount = attribute.count;
			let sum = 0;
			for (let i = 0; i < pointsCount; i++) {
				sum += attribute.getY(i);
			}
			return sum / pointsCount;
		};

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			assert.equal(_getGeometryBoundingBoxCenterY(), 1);
			scene.play();
			assert.equal(scene.time(), 0);
			await CoreSleep.sleep(100);
			assert.more_than(_getGeometryBoundingBoxCenterY(), 1.05, 'object scaled up');
		});
	});

	qUnit.test('sop/actorInstance setPointInstanceAttributeNumber', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const line1 = geo1.createNode('line');
		const attribCreate1 = geo1.createNode('attribCreate');
		const {instance1, actorInstance1} = prepareSopNodes(geo1);

		instance1.setInput(1, line1);
		const attribName = 'h';
		attribCreate1.setInput(0, instance1);
		actorInstance1.setInput(0, attribCreate1);
		attribCreate1.p.name.set(attribName);

		onCreateHookSetInstanceAttributeNumber(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
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

	qUnit.test('sop/actorInstance setPointAttributeNumberWithConstant', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const line1 = geo1.createNode('line');
		const attribCreate1 = geo1.createNode('attribCreate');
		const {instance1, actorInstance1} = prepareSopNodes(geo1);

		instance1.setInput(1, line1);
		const attribName = 'h';
		attribCreate1.setInput(0, instance1);
		actorInstance1.setInput(0, attribCreate1);
		attribCreate1.p.name.set(attribName);

		onCreateHookSetPointAttributeNumberWithConstantForAttribName(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
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

	qUnit.test('sop/actorInstance setPointAttributeVector2', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const perspective_camera1 = window.perspective_camera1;
		perspective_camera1.p.t.set([0, 1, 10]);
		const line1 = geo1.createNode('line');
		const attribCreate1 = geo1.createNode('attribCreate');
		const {instance1, actorInstance1} = prepareSopNodes(geo1);

		instance1.setInput(1, line1);
		attribCreate1.setInput(0, instance1);
		actorInstance1.setInput(0, attribCreate1);

		const attribName = 'h';
		attribCreate1.p.name.set(attribName);
		attribCreate1.p.size.set(2);

		onCreateHookSetPointAttributeVector2(actorInstance1);
		actorInstance1.flags.display.set(true);

		const container = await actorInstance1.compute();
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

	qUnit.test('sop/actorInstance persisted config is saved after scene play', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const {instance1, actorInstance1} = prepareSopNodes(geo1);
		instance1.setInput(1, box1);
		actorInstance1.flags.display.set(true);

		const onTick1 = actorInstance1.createNode('onTick');
		const setInstancePosition = actorInstance1.createNode('setInstancePosition');
		setInstancePosition.setInput(0, onTick1);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
			scene.play();
			await CoreSleep.sleep(100);

			const data = await new SceneJsonExporter(scene).data();
			assert.ok(data);
			const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
			assert.deepEqual(functionNodeNames, [actorInstance1.path()], 'actor is saved');
		});
		RendererUtils.dispose();
	});
	qUnit.test('sop/actorInstance persisted config is saved without requiring scene play', async (assert) => {
		const scene = window.scene;
		// const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const {instance1, actorInstance1} = prepareSopNodes(geo1);
		instance1.setInput(1, box1);
		actorInstance1.flags.display.set(true);

		const onTick1 = actorInstance1.createNode('onTick');
		const setInstancePosition = actorInstance1.createNode('setInstancePosition');
		setInstancePosition.setInput(0, onTick1);

		const data = await new SceneJsonExporter(scene).data();
		assert.ok(data);
		const functionNodeNames = Object.keys(data.jsFunctionBodies || {});
		assert.deepEqual(functionNodeNames, [actorInstance1.path()], 'actor is saved');
	});
}
