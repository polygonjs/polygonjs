import {CoreSleep} from './../../../../src/core/Sleep';
import {OnScenePlayStateActorNode} from '../../../../src/engine/nodes/actor/OnScenePlayState';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {RendererUtils} from '../../../helpers/RendererUtils';

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	const physicsWorldReset = node.createNode('physicsWorldReset');
	const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

QUnit.test('sop/physicsWorld simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const plane1 = geo1.createNode('plane');
	const box1 = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');

	copy1.setInput(0, box1);
	copy1.setInput(1, plane1);
	physicsRBDAttributes1.setInput(0, copy1);
	physicsWorld1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.flags.display.set(true);

	box1.p.size.set(0.25);

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.objects()[0].children;
	for (let object of objects) {
		assert.in_delta(object.position.y, 0, 0.01);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.less_than(object.position.y, -0.1);
		}
	});
});

QUnit.test('sop/physicsWorld with actor/setPhysicsWorldGravity', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const plane1 = geo1.createNode('plane');
	const box1 = geo1.createNode('box');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');

	const setPhysicsWorldGravity1 = physicsWorld1.createNode('setPhysicsWorldGravity');
	const onManualTrigger1 = physicsWorld1.createNode('onManualTrigger');
	setPhysicsWorldGravity1.setInput(0, onManualTrigger1);

	copy1.setInput(0, box1);
	copy1.setInput(1, plane1);
	physicsRBDAttributes1.setInput(0, copy1);
	physicsWorld1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.flags.display.set(true);

	box1.p.size.set(0.25);

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.objects()[0].children;
	for (let object of objects) {
		assert.in_delta(object.position.y, 0, 0.01);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.less_than(object.position.y, -0.1);
		}

		setPhysicsWorldGravity1.p.gravity.set([0, 100, 0]);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(1000);
		for (let object of objects) {
			assert.more_than(object.position.y, 0);
		}
	});
});
