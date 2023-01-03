import {CoreSleep} from '../../../../src/core/Sleep';
import {OnScenePlayStateActorNode} from '../../../../src/engine/nodes/actor/OnScenePlayState';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
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

QUnit.test('actor/physicsWorldReset simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const plane1 = geo1.createNode('plane');
	const sphere1 = geo1.createNode('sphere');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');

	copy1.setInput(0, sphere1);
	copy1.setInput(1, plane1);
	physicsRBDAttributes1.setInput(0, copy1);
	physicsWorld1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.flags.display.set(true);

	sphere1.p.radius.set(0.2);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	physicsRBDAttributes1.p.radius.set(0.2);
	physicsRBDAttributes1.p.restitution.set(0);

	createPhysicsWorldNodes(physicsWorld1);
	let container = await physicsWorld1.compute();
	let objects = container.coreContent()!.objects()[0].children;
	for (let object of objects) {
		assert.in_delta(object.position.y, 0, 0.01);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.less_than(object.position.y, -0.1, 'objects have gone down');
		}
		scene.pause();
		await CoreSleep.sleep(50);
		objects = container.coreContent()!.objects()[0].children;
		// check that the objects have been reset
		for (let object of objects) {
			assert.in_delta(object.position.y, 0, 0.01, 'objects are back to initial pos');
		}
	});
});
