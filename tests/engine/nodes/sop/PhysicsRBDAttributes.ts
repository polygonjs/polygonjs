import type {QUnit} from '../../../helpers/QUnit';
import {Object3D, Vector3} from 'three';
import {
	PhysicsCommonAttribute,
	PhysicsRBDCuboidAttribute,
	PhysicsRBDHeightAttribute,
	PhysicsRBDRadiusAttribute,
} from './../../../../src/core/physics/PhysicsAttribute';
import {CoreObject} from './../../../../src/core/geometry/modules/three/CoreObject';
import {PhysicsRBDColliderType} from '../../../../src/core/physics/PhysicsAttribute';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsWorldSopNode} from './../../../../src/engine/nodes/sop/PhysicsWorld';
import {SizeComputationMethod} from '../../../../src/engine/operations/sop/PhysicsRBDAttributes';
import {waitForPhysicsComputedAndMounted} from './physics/PhysicsHelper';
export function testenginenodessopPhysicsRBDAttributes(qUnit: QUnit) {
	function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
		const physicsWorldReset = node.createNode('physicsWorldReset');
		const onScenePause = node.createNode('onScenePause');
		const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
		const onTick = node.createNode('onTick');

		physicsWorldReset.setInput(0, onScenePause);
		physicsWorldStepSimulation.setInput(0, onTick);
	}

	qUnit.test('sop/physicsRBDAttributes simple', async (assert) => {
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
		const objects = container.coreContent()!.threejsObjects()[0].children;
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
	qUnit.test('sop/physicsRBDAttributes with expressions', async (assert) => {
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
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
		physicsRBDAttributes1.p.radius.set('rand(@ptnum)');

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map(
			(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number
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
	qUnit.test('sop/physicsRBDAttributes capsule', async (assert) => {
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
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CAPSULE);
		physicsRBDAttributes1.p.radius.set(0.25);
		physicsRBDAttributes1.p.height.set(0.6);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number;
		});
		const heights = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDHeightAttribute.HEIGHT) as number;
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
	qUnit.test('sop/physicsRBDAttributes cone', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const plane1 = geo1.createNode('plane');
		const cone1 = geo1.createNode('cone');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		copy1.setInput(0, cone1);
		copy1.setInput(1, plane1);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		cone1.p.radius.set(0.25);
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CONE);
		physicsRBDAttributes1.p.radius.set(0.25);
		physicsRBDAttributes1.p.height.set(0.6);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number;
		});
		const heights = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDHeightAttribute.HEIGHT) as number;
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
	qUnit.test('sop/physicsRBDAttributes convex hull', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const plane1 = geo1.createNode('plane');
		const cone1 = geo1.createNode('cone');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		copy1.setInput(0, cone1);
		copy1.setInput(1, plane1);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		cone1.p.radius.set(0.25);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CONVEX_HULL);
		physicsRBDAttributes1.p.radius.set(0.25);
		physicsRBDAttributes1.p.height.set(0.6);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;

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
	qUnit.test('sop/physicsRBDAttributes cuboid', async (assert) => {
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
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CUBOID);
		physicsRBDAttributes1.p.sizes.set([0.25, 0.3, 0.35]);
		physicsRBDAttributes1.p.size.set(0.55);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
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
	qUnit.test('sop/physicsRBDAttributes cuboid with expressions non entity dependent', async (assert) => {
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
		box1.p.sizes.set([0.9, 1.1, 1.2]);
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CUBOID);
		physicsRBDAttributes1.p.sizes.set([`ch('../${box1.name()}/sizesx')`, 0.3, 0.35]);
		physicsRBDAttributes1.p.size.set(0.55);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
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
			[0.9, 0.9, 0.9, 0.9]
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
	qUnit.test('sop/physicsRBDAttributes cuboid with expressions entity dependent', async (assert) => {
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
		box1.p.sizes.set([0.9, 1.1, 1.2]);
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CUBOID);
		physicsRBDAttributes1.p.sizes.set([`ch('../${box1.name()}/sizesx') + 0.1*@objnum`, 0.3, 0.35]);
		physicsRBDAttributes1.p.size.set(0.55);

		createPhysicsWorldNodes(physicsWorld1);
		// physicsWorld1.p.debug.set(true);
		const container = await physicsWorld1.compute();
		waitForPhysicsComputedAndMounted(physicsWorld1);

		const objects = container.coreContent()!.threejsObjects()[0].children;
		const sizess = objects.map((object: Object3D) => {
			const target = new Vector3();
			CoreObject.attribValue(object, PhysicsRBDCuboidAttribute.SIZES, 0, target);
			return target;
		});
		const sizes = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDCuboidAttribute.SIZE, 0) as number;
		});
		const sizesx = sizess.map((size: Vector3) => size.x);
		assert.in_delta(sizesx[0], 0.9, 0.001);
		assert.in_delta(sizesx[1], 1, 0.001);
		assert.in_delta(sizesx[2], 1.1, 0.001);
		assert.in_delta(sizesx[3], 1.2, 0.001);
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
	qUnit.test('sop/physicsRBDAttributes cylinder', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const plane1 = geo1.createNode('plane');
		const tube1 = geo1.createNode('tube');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		copy1.setInput(0, tube1);
		copy1.setInput(1, plane1);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		tube1.p.radiusTop.set(0.25);
		tube1.p.radiusBottom.set(0.25);
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CYLINDER);
		physicsRBDAttributes1.p.radius.set(0.25);
		physicsRBDAttributes1.p.height.set(0.6);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number;
		});
		const heights = objects.map((object: Object3D) => {
			return CoreObject.attribValue(object, PhysicsRBDHeightAttribute.HEIGHT) as number;
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
	qUnit.test('sop/physicsRBDAttributes sphere', async (assert) => {
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
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
		physicsRBDAttributes1.p.radius.set(0.25);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map(
			(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number
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
	qUnit.test('sop/physicsRBDAttributes sphere with expression non entity dependent', async (assert) => {
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
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
		physicsRBDAttributes1.p.radius.set(`ch('../${sphere1.name()}/radius')`);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map(
			(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number
		);
		assert.deepEqual(radii, [0.2, 0.2, 0.2, 0.2]);

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
	qUnit.test('sop/physicsRBDAttributes sphere with expression entity dependent', async (assert) => {
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

		sphere1.p.radius.set(0.3);
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.MANUAL);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
		physicsRBDAttributes1.p.radius.set(`ch('../${sphere1.name()}/radius') + 0.1*@objnum`);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map(
			(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number
		);
		assert.in_delta(radii[0], 0.3, 0.001);
		assert.in_delta(radii[1], 0.4, 0.001);
		assert.in_delta(radii[2], 0.5, 0.001);
		assert.in_delta(radii[3], 0.6, 0.001);

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
	qUnit.test('sop/physicsRBDAttributes sphere with size auto', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(20);

		const sphere1 = geo1.createNode('sphere');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		copy1.setInput(0, sphere1);
		copy1.p.count.set(4);
		copy1.p.t.x.set(2);
		copy1.p.scale.set(1.4);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		sphere1.p.radius.set(0.3);
		physicsRBDAttributes1.setSizeMethod(SizeComputationMethod.AUTO);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.SPHERE);
		physicsRBDAttributes1.p.radius.set(`ch('../${sphere1.name()}/radius') + 0.1*@objnum`);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;
		const radii = objects.map(
			(object: Object3D) => CoreObject.attribValue(object, PhysicsRBDRadiusAttribute.RADIUS) as number
		);
		assert.in_delta(radii[0], 0.3, 0.001);
		assert.in_delta(radii[1], 0.3, 0.001);
		assert.in_delta(radii[2], 0.3, 0.001);
		assert.in_delta(radii[3], 0.3, 0.001);

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
	qUnit.test('sop/physicsRBDAttributes trimesh', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const cameraNode = window.perspective_camera1;
		cameraNode.p.t.z.set(5);

		const plane1 = geo1.createNode('plane');
		const cone1 = geo1.createNode('cone');
		const copy1 = geo1.createNode('copy');
		const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
		const physicsWorld1 = geo1.createNode('physicsWorld');

		copy1.setInput(0, cone1);
		copy1.setInput(1, plane1);
		physicsRBDAttributes1.setInput(0, copy1);
		physicsWorld1.setInput(0, physicsRBDAttributes1);
		physicsWorld1.flags.display.set(true);

		cone1.p.radius.set(0.25);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.TRIMESH);

		createPhysicsWorldNodes(physicsWorld1);
		const container = await physicsWorld1.compute();
		const objects = container.coreContent()!.threejsObjects()[0].children;

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
	qUnit.test('sop/physicsRBDAttributes can sleep with expressions non entity dependent', async (assert) => {
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
		box1.p.sizes.set([0.9, 1.1, 1.2]);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CUBOID);
		physicsRBDAttributes1.p.sizes.set([0.9, 0.3, 0.35]);
		physicsRBDAttributes1.p.size.set(0.55);
		physicsRBDAttributes1.p.canSleep.set(`ch('../${box1.name()}/sizesx')<=1`);

		createPhysicsWorldNodes(physicsWorld1);

		async function _getCanSleeps() {
			const container = await physicsWorld1.compute();
			const objects = container.coreContent()!.threejsObjects()[0].children;

			const cansleeps = objects.map((object: Object3D) => {
				return CoreObject.attribValue(object, PhysicsCommonAttribute.CAN_SLEEP, 0) as boolean;
			});
			return cansleeps;
		}

		assert.deepEqual(await _getCanSleeps(), [true, true, true, true]);
		physicsRBDAttributes1.p.canSleep.set(`ch('../${box1.name()}/sizesx')>1`);
		assert.deepEqual(await _getCanSleeps(), [false, false, false, false]);
	});
	qUnit.test('sop/physicsRBDAttributes can sleep with expressions entity dependent', async (assert) => {
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
		box1.p.sizes.set([0.9, 1.1, 1.2]);
		physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CUBOID);
		physicsRBDAttributes1.p.sizes.set([0.9, 0.3, 0.35]);
		physicsRBDAttributes1.p.size.set(0.55);
		physicsRBDAttributes1.p.canSleep.set(`@objnum%2==1`);

		createPhysicsWorldNodes(physicsWorld1);

		async function _getCanSleeps() {
			const container = await physicsWorld1.compute();
			const objects = container.coreContent()!.threejsObjects()[0].children;

			const cansleeps = objects.map((object: Object3D) => {
				return CoreObject.attribValue(object, PhysicsCommonAttribute.CAN_SLEEP, 0) as boolean;
			});
			return cansleeps;
		}

		assert.deepEqual(await _getCanSleeps(), [false, true, false, true]);
		physicsRBDAttributes1.p.canSleep.set(`@objnum%2==0`);
		assert.deepEqual(await _getCanSleeps(), [true, false, true, false]);
	});
}
