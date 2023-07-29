import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsRBDColliderType, PhysicsRBDType} from '../../../../src/core/physics/PhysicsAttribute';
import {PhysicsRBDRadiusAttribute} from '../../../../src/core/physics/PhysicsAttribute';
import {RBDCapsuleProperty, _getPhysicsRBDCapsuleRadius} from '../../../../src/core/physics/shapes/RBDCapsule';
import {MultAddInput} from '../../../../src/engine/nodes/js/MultAdd';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
export function testenginenodesjsSetPhysicsRBDCapsuleProperty(qUnit: QUnit) {

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	// const physicsWorldReset = node.createNode('physicsWorldReset');
	// const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	// physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

qUnit.test('js/setPhysicsRBDCapsuleProperty simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const capsule1 = geo1.createNode('capsule');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');
	const actor1 = geo1.createNode('actor');

	physicsRBDAttributes1.setInput(0, capsule1);
	physicsRBDAttributes1.setRBDType(PhysicsRBDType.DYNAMIC);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CAPSULE);
	actor1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.setInput(0, actor1);
	physicsWorld1.flags.display.set(true);

	createPhysicsWorldNodes(physicsWorld1);
	const getPhysicsRBDCapsuleProperty1 = actor1.createNode('getPhysicsRBDCapsuleProperty');
	const setPhysicsRBDCapsuleProperty1 = actor1.createNode('setPhysicsRBDCapsuleProperty');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const multAdd1 = actor1.createNode('multAdd');
	setPhysicsRBDCapsuleProperty1.setInput(0, onManualTrigger1);
	getObjectAttribute1.setAttribName(PhysicsRBDRadiusAttribute.RADIUS);
	getObjectAttribute1.setAttribType(JsConnectionPointType.FLOAT);
	// setPhysicsRBDSphereProperty1.setInput(setPhysicsRBDSphereProperty1.p.radius.name(), getPhysicsRBDSphereProperty1);

	const container = await physicsWorld1.compute();
	const object = container.coreContent()!.threejsObjects()[0].children[0];
	assert.in_delta(object.position.y, 0, 0.01);
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(100);
		assert.in_delta(_getPhysicsRBDCapsuleRadius(object) || 0, 0.2, 0.001, 'original attrib value');
		assert.less_than(object.position.y, -0.01, 'object has gone down');

		//
		setPhysicsRBDCapsuleProperty1.p.scale.set(2);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(_getPhysicsRBDCapsuleRadius(object), 2);

		//
		scene.batchUpdates(() => {
			setPhysicsRBDCapsuleProperty1.p.scale.set(4);
			setPhysicsRBDCapsuleProperty1.p.lerp.set(0.5);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(_getPhysicsRBDCapsuleRadius(object), 3, 'with lerp=0.5');

		//
		scene.batchUpdates(() => {
			setPhysicsRBDCapsuleProperty1.setInput(setPhysicsRBDCapsuleProperty1.p.scale.name(), multAdd1);
			setPhysicsRBDCapsuleProperty1.p.lerp.set(1);
			multAdd1.setInput(MultAddInput.VALUE, getPhysicsRBDCapsuleProperty1, RBDCapsuleProperty.RADIUS);
			multAdd1.params.get('mult')!.set(2);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(_getPhysicsRBDCapsuleRadius(object), 6, 'radius x2');

		//
		setPhysicsRBDCapsuleProperty1.setInput(setPhysicsRBDCapsuleProperty1.p.scale.name(), getObjectAttribute1);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.in_delta(_getPhysicsRBDCapsuleRadius(object) || 0, 0.2, 0.001, 'back to original attrib value');
	});
});

}