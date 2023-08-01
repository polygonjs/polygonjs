import {CoreSleep} from '../../../../../src/core/Sleep';
import type {PhysicsDebugSopNode} from '../../../../../src/engine/nodes/sop/PhysicsDebug';
import type {PhysicsWorldSopNode} from '../../../../../src/engine/nodes/sop/PhysicsWorld';
export async function waitForPhysicsComputedAndMounted(node: PhysicsWorldSopNode) {
	node.flags.display.set(true);
	await node.compute();
	await CoreSleep.sleep(50);
}

export function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	const physicsWorldReset = node.createNode('physicsWorldReset');
	const onScenePause = node.createNode('onScenePause');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	physicsWorldReset.setInput(0, onScenePause);
	physicsWorldStepSimulation.setInput(0, onTick);
}

export function createPhysicsDebugNodes(node: PhysicsDebugSopNode) {
	const physicsDebugUpdate = node.createNode('physicsDebugUpdate');
	const onTick = node.createNode('onTick');

	physicsDebugUpdate.setInput(0, onTick);
}
