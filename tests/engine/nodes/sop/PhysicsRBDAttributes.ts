import {Object3D, Vector3} from 'three';
import {
	PhysicsRBDCapsuleAttribute,
	PhysicsRBDCuboidAttribute,
	PhysicsRBDSphereAttribute,
} from './../../../../src/core/physics/PhysicsAttribute';
import {CoreObject} from './../../../../src/core/geometry/Object';
import {PhysicsRBDColliderType} from '../../../../src/core/physics/PhysicsAttribute';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {OnScenePlayStateActorNode} from './../../../../src/engine/nodes/actor/OnScenePlayState';
import {PhysicsWorldSopNode} from './../../../../src/engine/nodes/sop/PhysicsWorld';

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	const physicsWorldReset = node.createNode('physicsWorldReset');
	const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

QUnit.test('sop/physicsRBDAttributes simple', async (assert) => {
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
QUnit.test('sop/physicsRBDAttributes with expressions', async (assert) => {
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

	sphere1.p.radius.set(0.25);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	physicsRBDAttributes1.p.radius.set('rand(@ptnum)');

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.objects()[0].children;
	const radii = objects.map(
		(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDSphereAttribute.RADIUS) as number
	);
	assert.in_delta(radii[0], 0.07, 0.05);
	assert.in_delta(radii[1], 0.075, 0.05);
	assert.in_delta(radii[2], 0.78, 0.05);
	assert.in_delta(radii[3], 0.67, 0.05);

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
QUnit.test('sop/physicsRBDAttributes capsule', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const plane1 = geo1.createNode('plane');
	const capsule1 = geo1.createNode('capsule');
	const copy1 = geo1.createNode('copy');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');

	copy1.setInput(0, capsule1);
	copy1.setInput(1, plane1);
	physicsRBDAttributes1.setInput(0, copy1);
	physicsWorld1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.flags.display.set(true);

	capsule1.p.radius.set(0.25);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CAPSULE);
	physicsRBDAttributes1.p.radius.set(0.25);
	physicsRBDAttributes1.p.height.set(0.6);

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.objects()[0].children;
	const radii = objects.map((object: Object3D) => {
		return CoreObject.attribValue(object, PhysicsRBDCapsuleAttribute.RADIUS) as number;
	});
	const heights = objects.map((object: Object3D) => {
		return CoreObject.attribValue(object, PhysicsRBDCapsuleAttribute.HEIGHT) as number;
	});
	assert.deepEqual(radii, [0.25, 0.25, 0.25, 0.25]);
	assert.deepEqual(heights, [0.6, 0.6, 0.6, 0.6]);

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
QUnit.test('sop/physicsRBDAttributes cuboid', async (assert) => {
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
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CUBOID);
	physicsRBDAttributes1.p.sizes.set([0.25, 0.3, 0.35]);
	physicsRBDAttributes1.p.size.set(0.55);

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.objects()[0].children;
	const sizess = objects.map((object: Object3D) => {
		const target = new Vector3();
		CoreObject.attribValue(object, PhysicsRBDCuboidAttribute.SIZES, 0, target);
		return target;
	});
	const sizes = objects.map((object: Object3D) => {
		return CoreObject.attribValue(object, PhysicsRBDCuboidAttribute.SIZE, 0) as number;
	});
	assert.deepEqual(
		sizess.map((size: Vector3) => size.x),
		[0.25, 0.25, 0.25, 0.25]
	);
	assert.deepEqual(
		sizess.map((size: Vector3) => size.y),
		[0.3, 0.3, 0.3, 0.3]
	);
	assert.deepEqual(
		sizess.map((size: Vector3) => size.z),
		[0.35, 0.35, 0.35, 0.35]
	);
	assert.deepEqual(sizes, [0.55, 0.55, 0.55, 0.55]);

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
QUnit.test('sop/physicsRBDAttributes sphere', async (assert) => {
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

	sphere1.p.radius.set(0.25);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
	physicsRBDAttributes1.p.radius.set(0.25);

	createPhysicsWorldNodes(physicsWorld1);
	const container = await physicsWorld1.compute();
	const objects = container.coreContent()!.objects()[0].children;
	const radii = objects.map(
		(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDSphereAttribute.RADIUS) as number
	);
	assert.deepEqual(radii, [0.25, 0.25, 0.25, 0.25]);

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
