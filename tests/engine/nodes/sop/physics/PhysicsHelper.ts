import {CoreSleep} from '../../../../../src/core/Sleep';
import {PhysicsWorldSopNode} from '../../../../../src/engine/nodes/sop/PhysicsWorld';

export async function waitForPhysicsComputedAndMounted(node: PhysicsWorldSopNode) {
	node.flags.display.set(true);
	await node.compute();
	await CoreSleep.sleep(50);
}
