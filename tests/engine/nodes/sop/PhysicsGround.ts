import {CoreSleep} from './../../../../src/core/Sleep';
import {OnScenePlayStateActorNode} from '../../../../src/engine/nodes/actor/OnScenePlayState';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {SizeComputationMethod} from '../../../../src/engine/operations/sop/PhysicsRBDAttributes';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsRBDColliderType} from '../../../../src/core/physics/PhysicsAttribute';

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	const physicsWorldReset = node.createNode('physicsWorldReset');
	const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.OUTPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

QUnit.test('sop/physicsGround simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(10);
	cameraNode.p.t.y.set(2);

	scene.createNode('hemisphereLight');

	const plane1 = geo1.createNode('plane');
	const sphere1 = geo1.createNode('sphere');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');
	const physicsGround1 = geo1.createNode('physicsGround');
	const merge1 = geo1.createNode('merge');

	copy1.setInput(0, sphere1);
	copy1.setInput(1, plane1);
	physicsRBDAttributes1.setInput(0, copy1);
	merge1.setInput(0, physicsGround1);
	merge1.setInput(1, physicsRBDAttributes1);
	physicsWorld1.setInput(0, merge1);
	physicsWorld1.flags.display.set(true);
	physicsWorld1.p.debug.set(true);

	plane1.p.center.set([0, 2, 0]);
	sphere1.p.radius.set(0.2);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
	physicsRBDAttributes1.p.radius.set(0.2);
	physicsRBDAttributes1.p.restitution.set(0);

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = [...container.coreContent()!.objects()[0].children];
	objects.shift();
	for (let object of objects) {
		assert.in_delta(object.position.y, 2, 0.01);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(1000);
		for (let object of objects) {
			assert.in_delta(object.position.y, 0.2, 0.05, 'test 1');
		}
		// check that we are still on the ground
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.in_delta(object.position.y, 0.2, 0.05, 'test 2');
		}
	});
});
