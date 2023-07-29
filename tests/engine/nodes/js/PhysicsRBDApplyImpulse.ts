import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsRBDColliderType} from '../../../../src/core/physics/PhysicsAttribute';
export function testenginenodesjsPhysicsRBDApplyImpulse(qUnit: QUnit) {

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	// const physicsWorldReset = node.createNode('physicsWorldReset');
	// const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	// physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

qUnit.test('js/physicsRBDApplyImpulse simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const plane1 = geo1.createNode('plane');
	const sphere1 = geo1.createNode('sphere');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');
	const actor1 = geo1.createNode('actor');

	createPhysicsWorldNodes(physicsWorld1);
	const physicsRBDApplyImpulse1 = actor1.createNode('physicsRBDApplyImpulse');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	physicsRBDApplyImpulse1.setInput(0, onManualTrigger1);
	physicsRBDApplyImpulse1.p.impulse.set([0, 1, 0]);

	copy1.setInput(0, sphere1);
	copy1.setInput(1, plane1);
	physicsRBDAttributes1.setInput(0, copy1);
	actor1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.setInput(0, actor1);
	physicsWorld1.flags.display.set(true);

	sphere1.p.radius.set(0.2);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	physicsRBDAttributes1.p.radius.set(0.2);
	physicsRBDAttributes1.p.restitution.set(0);

	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.threejsObjects()[0].children;
	for (let object of objects) {
		assert.in_delta(object.position.y, 0, 0.01);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.less_than(object.position.y, -0.1, 'objects have gone down');
		}
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(500);
		// check that the objects have been reset
		for (let object of objects) {
			assert.more_than(object.position.y, 1, 'objects moved up by impulse');
		}
	});
});

}