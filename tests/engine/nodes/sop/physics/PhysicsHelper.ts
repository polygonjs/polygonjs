import {CoreSleep} from '../../../../../src/core/Sleep';
import {PhysicsWorldSopNode} from '../../../../../src/engine/nodes/sop/PhysicsWorld';
import {OnScenePlayStateActorNode} from '../../../../../src/engine/nodes/actor/OnScenePlayState';
export async function waitForPhysicsComputedAndMounted(node: PhysicsWorldSopNode) {
	node.flags.display.set(true);
	await node.compute();
	await CoreSleep.sleep(50);
}

export function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	const physicsWorldReset = node.createNode('physicsWorldReset');
	const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.OUTPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}
