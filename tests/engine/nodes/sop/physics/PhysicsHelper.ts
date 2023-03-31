import {CoreSleep} from '../../../../../src/core/Sleep';
import {PhysicsWorldSopNode} from '../../../../../src/engine/nodes/sop/PhysicsWorld';
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
