import {CoreSleep} from '../../../../src/core/Sleep';
// import {OnScenePlayStateActorNode} from '../../../../src/engine/nodes/actor/OnScenePlayState';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsRBDColliderType, PhysicsRBDType} from '../../../../src/core/physics/PhysicsAttribute';

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	// const physicsWorldReset = node.createNode('physicsWorldReset');
	// const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	// physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

QUnit.test('actor/setPhysicsRBDPosition simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const add1 = geo1.createNode('add');
	const sphere1 = geo1.createNode('sphere');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');
	const actor1 = geo1.createNode('actor');

	createPhysicsWorldNodes(physicsWorld1);
	const setPhysicsRBDPosition1 = actor1.createNode('setPhysicsRBDPosition');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	setPhysicsRBDPosition1.setInput(0, onManualTrigger1);
	setPhysicsRBDPosition1.p.position.set([10, 20, 45]);

	copy1.setInput(0, sphere1);
	copy1.setInput(1, add1);
	physicsRBDAttributes1.setInput(0, copy1);
	physicsRBDAttributes1.setRBDType(PhysicsRBDType.KINEMATIC_POS);
	actor1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.setInput(0, actor1);
	physicsWorld1.flags.display.set(true);

	sphere1.p.radius.set(0.2);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	physicsRBDAttributes1.p.radius.set(0.2);
	physicsRBDAttributes1.p.restitution.set(0);

	const container = await physicsWorld1.compute();
	const object = container.coreContent()!.threejsObjects()[0].children[0];
	assert.in_delta(object.position.y, 0, 0.01);
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		assert.in_delta(object.position.y, 0, 0.01, 'object has not gone down');
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		// check that the objects have been reset
		assert.in_delta(object.position.x, 10, 0.01, 'objects set to pos');
		assert.in_delta(object.position.y, 20, 0.01, 'objects set to pos');
		assert.in_delta(object.position.z, 45, 0.01, 'objects set to pos');
	});
});
