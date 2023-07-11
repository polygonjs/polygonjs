import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {RootManagerNode} from './../../../../src/engine/nodes/manager/Root';
import {GeoObjNode} from './../../../../src/engine/nodes/obj/Geo';
import {PhysicsWorldSopNode} from './../../../../src/engine/nodes/sop/PhysicsWorld';
import {CameraControlsSopNode} from './../../../../src/engine/nodes/sop/CameraControls';
import {BaseNodeType} from '../../../../src/engine/nodes/_Base';

interface ReturnedNodeData {
	node: BaseNodeType;
	children: Record<string, ReturnedNodeData>;
}
type ReturnedNodeDataDict = Record<string, ReturnedNodeData>;

function createScene(root: RootManagerNode) {
	function create_ground(parentNode: RootManagerNode) {
		var ground = parentNode.createNode('geo');
		ground.setName('ground');
		const ground_nodes: ReturnedNodeDataDict = {};
		function create_capsule1(ground: GeoObjNode) {
			var capsule1 = ground.createNode('capsule');
			capsule1.setName('capsule1');
			const capsule1_nodes: ReturnedNodeDataDict = {};
			capsule1.uiData.setPosition(450, -400);
			capsule1.params.postCreateSpareParams();
			capsule1.params.runOnSceneLoadHooks();
			capsule1.flags.display.set(true);
			return {node: capsule1, children: capsule1_nodes};
		}
		function create_copy1(ground: GeoObjNode) {
			var copy1 = ground.createNode('copy');
			copy1.setName('copy1');
			const copy1_nodes: ReturnedNodeDataDict = {};
			copy1.uiData.setPosition(450, -50);
			copy1.p.count.set(7);
			copy1.p.t.set([0, 0, -1]);
			copy1.params.postCreateSpareParams();
			copy1.params.runOnSceneLoadHooks();
			return {node: copy1, children: copy1_nodes};
		}
		function create_merge1(ground: GeoObjNode) {
			var merge1 = ground.createNode('merge');
			merge1.setName('merge1');
			const merge1_nodes: ReturnedNodeDataDict = {};
			merge1.uiData.setPosition(50, 850);
			merge1.params.postCreateSpareParams();
			merge1.params.runOnSceneLoadHooks();
			return {node: merge1, children: merge1_nodes};
		}
		function create_physicsGround1(ground: GeoObjNode) {
			var physicsGround1 = ground.createNode('physicsGround');
			physicsGround1.setName('physicsGround1');
			const physicsGround1_nodes: ReturnedNodeDataDict = {};
			physicsGround1.uiData.setPosition(-50, 500);
			physicsGround1.params.postCreateSpareParams();
			physicsGround1.params.runOnSceneLoadHooks();
			return {node: physicsGround1, children: physicsGround1_nodes};
		}
		function create_physicsRBDAttributes1(ground: GeoObjNode) {
			var physicsRBDAttributes1 = ground.createNode('physicsRBDAttributes');
			physicsRBDAttributes1.setName('physicsRBDAttributes1');
			const physicsRBDAttributes1_nodes: ReturnedNodeDataDict = {};
			physicsRBDAttributes1.uiData.setPosition(450, 250);
			physicsRBDAttributes1.p.colliderType.set(2);
			physicsRBDAttributes1.p.friction.set(0.16);
			physicsRBDAttributes1.p.restitution.set(0.8);
			physicsRBDAttributes1.p.linearVelocity.set([0.1, 5, 0]);
			physicsRBDAttributes1.p.angularVelocity.set([2.2, 4, 5]);
			physicsRBDAttributes1.p.gravityScale.set(1.6);
			physicsRBDAttributes1.params.postCreateSpareParams();
			physicsRBDAttributes1.params.runOnSceneLoadHooks();
			return {node: physicsRBDAttributes1, children: physicsRBDAttributes1_nodes};
		}
		function create_physicsRBDJoints1(ground: GeoObjNode) {
			var physicsRBDJoints1 = ground.createNode('physicsRBDJoints');
			physicsRBDJoints1.setName('physicsRBDJoints1');
			const physicsRBDJoints1_nodes: ReturnedNodeDataDict = {};
			physicsRBDJoints1.uiData.setPosition(450, 550);
			physicsRBDJoints1.p.maxDistance.set(1.001);
			physicsRBDJoints1.params.postCreateSpareParams();
			physicsRBDJoints1.params.runOnSceneLoadHooks();
			return {node: physicsRBDJoints1, children: physicsRBDJoints1_nodes};
		}
		function create_physicsWorld1(ground: GeoObjNode) {
			var physicsWorld1 = ground.createNode('physicsWorld');
			physicsWorld1.setName('physicsWorld1');
			const physicsWorld1_nodes: ReturnedNodeDataDict = {};
			function create_onScenePause(physicsWorld1: PhysicsWorldSopNode) {
				var onScenePlayState1 = physicsWorld1.createNode('onScenePause');
				onScenePlayState1.setName('onScenePause1');
				const onScenePlayState1_nodes: ReturnedNodeDataDict = {};
				onScenePlayState1.uiData.setPosition(-100, -100);
				onScenePlayState1.params.postCreateSpareParams();
				onScenePlayState1.params.runOnSceneLoadHooks();
				return {node: onScenePlayState1, children: onScenePlayState1_nodes};
			}
			function create_onTick1(physicsWorld1: PhysicsWorldSopNode) {
				var onTick1 = physicsWorld1.createNode('onTick');
				onTick1.setName('onTick1');
				const onTick1_nodes: ReturnedNodeDataDict = {};
				onTick1.uiData.setPosition(-100, 100);
				onTick1.params.postCreateSpareParams();
				onTick1.params.runOnSceneLoadHooks();
				return {node: onTick1, children: onTick1_nodes};
			}
			function create_physicsWorldReset1(physicsWorld1: PhysicsWorldSopNode) {
				var physicsWorldReset1 = physicsWorld1.createNode('physicsWorldReset');
				physicsWorldReset1.setName('physicsWorldReset1');
				const physicsWorldReset1_nodes: ReturnedNodeDataDict = {};
				physicsWorldReset1.uiData.setPosition(100, -100);
				physicsWorldReset1.params.postCreateSpareParams();
				physicsWorldReset1.params.runOnSceneLoadHooks();
				return {node: physicsWorldReset1, children: physicsWorldReset1_nodes};
			}
			function create_physicsWorldStepSimulation1(physicsWorld1: PhysicsWorldSopNode) {
				var physicsWorldStepSimulation1 = physicsWorld1.createNode('physicsWorldStepSimulation');
				physicsWorldStepSimulation1.setName('physicsWorldStepSimulation1');
				const physicsWorldStepSimulation1_nodes: ReturnedNodeDataDict = {};
				physicsWorldStepSimulation1.uiData.setPosition(100, 100);
				physicsWorldStepSimulation1.params.postCreateSpareParams();
				physicsWorldStepSimulation1.params.runOnSceneLoadHooks();
				return {node: physicsWorldStepSimulation1, children: physicsWorldStepSimulation1_nodes};
			}
			physicsWorld1_nodes['onScenePause'] = create_onScenePause(physicsWorld1);
			physicsWorld1_nodes['onTick1'] = create_onTick1(physicsWorld1);
			physicsWorld1_nodes['physicsWorldReset1'] = create_physicsWorldReset1(physicsWorld1);
			physicsWorld1_nodes['physicsWorldStepSimulation1'] = create_physicsWorldStepSimulation1(physicsWorld1);
			physicsWorld1_nodes['physicsWorldReset1'].node.setInput(
				'trigger',
				physicsWorld1_nodes['onScenePause'].node
			);
			physicsWorld1_nodes['physicsWorldStepSimulation1'].node.setInput(
				'trigger',
				physicsWorld1_nodes['onTick1'].node,
				'trigger'
			);
			if (physicsWorld1.childrenController) {
				physicsWorld1.childrenController.selection.set([]);
			}
			physicsWorld1.uiData.setPosition(50, 1000);

			// physicsWorld1.p.debug.set(true);
			physicsWorld1.params.postCreateSpareParams();
			physicsWorld1.params.runOnSceneLoadHooks();
			return {node: physicsWorld1, children: physicsWorld1_nodes};
		}
		function create_transform1(ground: GeoObjNode) {
			var transform1 = ground.createNode('transform');
			transform1.setName('transform1');
			const transform1_nodes: ReturnedNodeDataDict = {};
			transform1.uiData.setPosition(450, -200);
			transform1.p.applyOn.set(1);
			transform1.p.t.set([0, 1.630723637778106, 0]);
			transform1.params.postCreateSpareParams();
			transform1.params.runOnSceneLoadHooks();
			return {node: transform1, children: transform1_nodes};
		}
		function create_transform2(ground: GeoObjNode) {
			var transform2 = ground.createNode('transform');
			transform2.setName('transform2');
			const transform2_nodes: ReturnedNodeDataDict = {};
			transform2.uiData.setPosition(450, 100);
			transform2.p.applyOn.set(1);
			transform2.p.objectMode.set(1);
			transform2.p.t.set([0, 0, 0.4369471000430467]);
			transform2.params.postCreateSpareParams();
			transform2.params.runOnSceneLoadHooks();
			return {node: transform2, children: transform2_nodes};
		}
		ground_nodes['capsule1'] = create_capsule1(ground);
		ground_nodes['copy1'] = create_copy1(ground);
		ground_nodes['merge1'] = create_merge1(ground);
		ground_nodes['physicsGround1'] = create_physicsGround1(ground);
		ground_nodes['physicsRBDAttributes1'] = create_physicsRBDAttributes1(ground);
		ground_nodes['physicsRBDJoints1'] = create_physicsRBDJoints1(ground);
		ground_nodes['physicsWorld1'] = create_physicsWorld1(ground);
		ground_nodes['transform1'] = create_transform1(ground);
		ground_nodes['transform2'] = create_transform2(ground);
		ground_nodes['copy1'].node.setInput(0, ground_nodes['transform1'].node);
		ground_nodes['merge1'].node.setInput(0, ground_nodes['physicsGround1'].node);
		ground_nodes['merge1'].node.setInput(1, ground_nodes['physicsRBDJoints1'].node);
		ground_nodes['physicsRBDAttributes1'].node.setInput(0, ground_nodes['transform2'].node);
		ground_nodes['physicsRBDJoints1'].node.setInput(0, ground_nodes['physicsRBDAttributes1'].node);
		ground_nodes['physicsWorld1'].node.setInput(0, ground_nodes['merge1'].node);
		ground_nodes['transform1'].node.setInput(0, ground_nodes['capsule1'].node);
		ground_nodes['transform2'].node.setInput(0, ground_nodes['copy1'].node);
		if (ground.childrenController) {
			ground.childrenController.selection.set([]);
		}
		ground.uiData.setPosition(-50, -400);
		ground.flags.display.set(true);
		ground.params.postCreateSpareParams();
		ground.params.runOnSceneLoadHooks();
		return {node: ground, children: ground_nodes};
	}
	function create_lights(parentNode: RootManagerNode) {
		var lights = parentNode.createNode('geo');
		lights.setName('lights');
		const lights_nodes: ReturnedNodeDataDict = {};
		function create_hemisphereLight1(lights: GeoObjNode) {
			var hemisphereLight1 = lights.createNode('hemisphereLight');
			hemisphereLight1.setName('hemisphereLight1');
			const hemisphereLight1_nodes: ReturnedNodeDataDict = {};
			hemisphereLight1.uiData.setPosition(50, -50);
			hemisphereLight1.p.intensity.set(0.52);
			hemisphereLight1.params.postCreateSpareParams();
			hemisphereLight1.params.runOnSceneLoadHooks();
			return {node: hemisphereLight1, children: hemisphereLight1_nodes};
		}
		function create_merge1(lights: GeoObjNode) {
			var merge1 = lights.createNode('merge');
			merge1.setName('merge1');
			const merge1_nodes: ReturnedNodeDataDict = {};
			merge1.uiData.setPosition(100, 300);
			merge1.flags.display.set(true);
			merge1.params.postCreateSpareParams();
			merge1.params.runOnSceneLoadHooks();
			return {node: merge1, children: merge1_nodes};
		}
		function create_polarTransform1(lights: GeoObjNode) {
			var polarTransform1 = lights.createNode('polarTransform');
			polarTransform1.setName('polarTransform1');
			const polarTransform1_nodes: ReturnedNodeDataDict = {};
			polarTransform1.uiData.setPosition(300, 150);
			polarTransform1.p.center.set([0, 0.7, 0]);
			polarTransform1.p.latitude.set(25.2);
			polarTransform1.p.depth.set(3);
			polarTransform1.params.postCreateSpareParams();
			polarTransform1.params.runOnSceneLoadHooks();
			return {node: polarTransform1, children: polarTransform1_nodes};
		}
		function create_spotLight1(lights: GeoObjNode) {
			var spotLight1 = lights.createNode('spotLight');
			spotLight1.setName('spotLight1');
			const spotLight1_nodes: ReturnedNodeDataDict = {};
			spotLight1.uiData.setPosition(300, -50);
			spotLight1.p.distance.set(10);
			spotLight1.p.showHelper.set(true);
			spotLight1.p.castShadow.set(true);
			spotLight1.params.postCreateSpareParams();
			spotLight1.params.runOnSceneLoadHooks();
			return {node: spotLight1, children: spotLight1_nodes};
		}
		lights_nodes['hemisphereLight1'] = create_hemisphereLight1(lights);
		lights_nodes['merge1'] = create_merge1(lights);
		lights_nodes['polarTransform1'] = create_polarTransform1(lights);
		lights_nodes['spotLight1'] = create_spotLight1(lights);
		lights_nodes['merge1'].node.setInput(0, lights_nodes['hemisphereLight1'].node);
		lights_nodes['merge1'].node.setInput(1, lights_nodes['polarTransform1'].node);
		lights_nodes['polarTransform1'].node.setInput(0, lights_nodes['spotLight1'].node);
		if (lights.childrenController) {
			lights.childrenController.selection.set([lights_nodes['hemisphereLight1'].node]);
		}
		lights.uiData.setPosition(-50, -250);
		lights.flags.display.set(true);
		lights.params.postCreateSpareParams();
		lights.params.runOnSceneLoadHooks();
		return {node: lights, children: lights_nodes};
	}
	function create_cameras(parentNode: RootManagerNode) {
		var cameras = parentNode.createNode('geo');
		cameras.setName('cameras');
		const cameras_nodes: ReturnedNodeDataDict = {};
		function create_cameraControls1(cameras: GeoObjNode) {
			var cameraControls1 = cameras.createNode('cameraControls');
			cameraControls1.setName('cameraControls1');
			const cameraControls1_nodes: ReturnedNodeDataDict = {};
			function create_cameraOrbitControls1(cameraControls1: CameraControlsSopNode) {
				var cameraOrbitControls1 = cameraControls1.createNode('cameraOrbitControls');
				cameraOrbitControls1.setName('cameraOrbitControls1');
				const cameraOrbitControls1_nodes: ReturnedNodeDataDict = {};
				cameraOrbitControls1.uiData.setPosition(0, 0);
				cameraOrbitControls1.p.target.set([0.3987993060246952, 0.649492863825553, -2.0311322247305936]);
				cameraOrbitControls1.params.postCreateSpareParams();
				cameraOrbitControls1.params.runOnSceneLoadHooks();
				return {node: cameraOrbitControls1, children: cameraOrbitControls1_nodes};
			}
			cameraControls1_nodes['cameraOrbitControls1'] = create_cameraOrbitControls1(cameraControls1);
			if (cameraControls1.childrenController) {
				cameraControls1.childrenController.selection.set([]);
			}
			cameraControls1.uiData.setPosition(0, 150);
			cameraControls1.flags.display.set(true);
			cameraControls1.p.node.set('cameraOrbitControls1');
			cameraControls1.params.postCreateSpareParams();
			cameraControls1.params.runOnSceneLoadHooks();
			return {node: cameraControls1, children: cameraControls1_nodes};
		}
		function create_perspectiveCamera1(cameras: GeoObjNode) {
			var perspectiveCamera1 = cameras.createNode('perspectiveCamera');
			perspectiveCamera1.setName('perspectiveCamera1');
			const perspectiveCamera1_nodes: ReturnedNodeDataDict = {};
			perspectiveCamera1.uiData.setPosition(0, -50);
			perspectiveCamera1.p.position.set([7.889264695689126, 3.1886989505468923, -0.14380807830371833]);
			perspectiveCamera1.p.rotation.set([-53.37756234168124, 67.10199660975059, 51.1015270677412]);
			perspectiveCamera1.params.postCreateSpareParams();
			perspectiveCamera1.params.runOnSceneLoadHooks();
			return {node: perspectiveCamera1, children: perspectiveCamera1_nodes};
		}
		cameras_nodes['cameraControls1'] = create_cameraControls1(cameras);
		cameras_nodes['perspectiveCamera1'] = create_perspectiveCamera1(cameras);
		cameras_nodes['cameraControls1'].node.setInput(0, cameras_nodes['perspectiveCamera1'].node);
		if (cameras.childrenController) {
			cameras.childrenController.selection.set([]);
		}
		cameras.uiData.setPosition(-50, -150);
		cameras.flags.display.set(true);
		cameras.params.postCreateSpareParams();
		cameras.params.runOnSceneLoadHooks();
		return {node: cameras, children: cameras_nodes};
	}
	const scene_root_nodes = {
		lights: create_lights(root),
		cameras: create_cameras(root),
		ground: create_ground(root),
	};

	return scene_root_nodes;
}

QUnit.test('sop/physicsRBDJoints simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.x.set(20);
	cameraNode.p.t.y.set(1);
	cameraNode.p.r.y.set(90);

	const scene_root_nodes = createScene(scene.root());
	const ground = scene_root_nodes.ground;

	const physicsWorld1 = ground.node.nodesByType(PhysicsWorldSopNode.type())[0];
	physicsWorld1.flags.display.set(true);
	const container = await physicsWorld1.compute();
	const objects = [...container.coreContent()!.threejsObjects()[0].children];
	objects.shift();
	assert.equal(objects.length, 7, 'we only have the rbds, not the ground or joints');
	for (let object of objects) {
		assert.more_than(object.position.y, 1);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.more_than(object.position.y, 0.1);
		}
		await CoreSleep.sleep(3000);
		for (let object of objects) {
			assert.less_than(object.position.y, -0.1);
		}
	});
});

QUnit.test('sop/physicsRBDJoints simple with clone', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.x.set(20);
	cameraNode.p.t.y.set(1);
	cameraNode.p.r.y.set(90);

	const scene_root_nodes = createScene(scene.root());
	const ground = scene_root_nodes.ground;

	const physicsWorld1 = ground.node.nodesByType(PhysicsWorldSopNode.type())[0];
	const null1 = ground.node.createNode('null');
	null1.setInput(0, physicsWorld1);
	null1.flags.display.set(true);
	const container = await null1.compute();
	const objects = [...container.coreContent()!.threejsObjects()[0].children];
	objects.shift();
	assert.equal(objects.length, 7, 'we only have the rbds, not the ground or joints');
	for (let object of objects) {
		assert.more_than(object.position.y, 1);
	}
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(500);
		for (let object of objects) {
			assert.more_than(object.position.y, 0.1);
		}
		await CoreSleep.sleep(3000);
		for (let object of objects) {
			assert.less_than(object.position.y, -0.1);
		}
	});
});
