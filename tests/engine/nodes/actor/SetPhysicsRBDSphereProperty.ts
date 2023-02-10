import {CoreSleep} from '../../../../src/core/Sleep';
// import {OnScenePlayStateActorNode} from '../../../../src/engine/nodes/actor/OnScenePlayState';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsRBDColliderType, PhysicsRBDType} from '../../../../src/core/physics/PhysicsAttribute';
import {PhysicsRBDRadiusAttribute} from '../../../../src/core/physics/PhysicsAttribute';
import {getPhysicsRBDSphereRadius} from '../../../../src/core/physics/shapes/RBDSphere';
import {MultAddActorNodeInputName} from '../../../../src/engine/nodes/actor/MultAdd';
import {GetPhysicsRBDSpherePropertyActorNodeInputName} from '../../../../src/engine/nodes/actor/GetPhysicsRBDSphereProperty';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	// const physicsWorldReset = node.createNode('physicsWorldReset');
	// const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	// physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

QUnit.test('actor/setPhysicsRBDSphereProperty simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const sphere1 = geo1.createNode('sphere');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');
	const actor1 = geo1.createNode('actor');

	physicsRBDAttributes1.setInput(0, sphere1);
	physicsRBDAttributes1.setRBDType(PhysicsRBDType.DYNAMIC);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	actor1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.setInput(0, actor1);
	physicsWorld1.flags.display.set(true);

	createPhysicsWorldNodes(physicsWorld1);
	const getPhysicsRBDSphereProperty1 = actor1.createNode('getPhysicsRBDSphereProperty');
	const setPhysicsRBDSphereProperty1 = actor1.createNode('setPhysicsRBDSphereProperty');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const multAdd1 = actor1.createNode('multAdd');
	setPhysicsRBDSphereProperty1.setInput(0, onManualTrigger1);
	getObjectAttribute1.p.attribName.set(PhysicsRBDRadiusAttribute.RADIUS);
	getObjectAttribute1.setAttribType(ActorConnectionPointType.FLOAT);
	// setPhysicsRBDSphereProperty1.setInput(setPhysicsRBDSphereProperty1.p.radius.name(), getPhysicsRBDSphereProperty1);

	const container = await physicsWorld1.compute();
	const object = container.coreContent()!.objects()[0].children[0];
	assert.in_delta(object.position.y, 0, 0.01);
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(100);
		assert.less_than(object.position.y, -0.01, 'object has gone down');

		//
		setPhysicsRBDSphereProperty1.p.radius.set(2);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(getPhysicsRBDSphereRadius(object), 2);

		//
		setPhysicsRBDSphereProperty1.p.radius.set(4);
		setPhysicsRBDSphereProperty1.p.lerp.set(0.5);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(getPhysicsRBDSphereRadius(object), 3, 'with lerp=0.5');

		//
		setPhysicsRBDSphereProperty1.setInput(setPhysicsRBDSphereProperty1.p.radius.name(), multAdd1);
		setPhysicsRBDSphereProperty1.p.lerp.set(1);
		multAdd1.setInput(
			MultAddActorNodeInputName.VALUE,
			getPhysicsRBDSphereProperty1,
			GetPhysicsRBDSpherePropertyActorNodeInputName.radius
		);
		multAdd1.params.get('mult')!.set(2);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(getPhysicsRBDSphereRadius(object), 6, 'radius x2');

		//
		setPhysicsRBDSphereProperty1.setInput(setPhysicsRBDSphereProperty1.p.radius.name(), getObjectAttribute1);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.in_delta(getPhysicsRBDSphereRadius(object) || 0, 1, 0.001, 'back to original attrib value');
	});
});
