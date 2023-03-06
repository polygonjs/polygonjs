import {Mesh, PerspectiveCamera} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {GeoObjNode} from '../../../../src/engine/nodes/obj/Geo';
import {ActorSopNode} from '../../../../src/engine/nodes/sop/Actor';
import {MergeSopNode} from '../../../../src/engine/nodes/sop/Merge';
import {BaseNodeType} from '../../../../src/engine/nodes/_Base';
import {ThreejsViewer} from '../../../../src/engine/viewers/Threejs';
import {RendererUtils} from '../../../helpers/RendererUtils';

interface ReturnedNodeData {
	node: BaseNodeType;
	children: Record<string, ReturnedNodeData>;
}
type ReturnedNodeDataDict = Record<string, ReturnedNodeData>;

function _createScene(parentNode: GeoObjNode) {
	const cameras_nodes: ReturnedNodeDataDict = {};

	function create_perspectiveCamera3(parentNode: GeoObjNode) {
		var perspectiveCamera3 = parentNode.createNode('perspectiveCamera');
		perspectiveCamera3.setName('perspectiveCamera3');
		const perspectiveCamera3_nodes: ReturnedNodeDataDict = {};
		perspectiveCamera3.uiData.setPosition(800, -300);
		perspectiveCamera3.params.postCreateSpareParams();
		perspectiveCamera3.params.runOnSceneLoadHooks();
		return {node: perspectiveCamera3, children: perspectiveCamera3_nodes};
	}
	function create_transform3(parentNode: GeoObjNode) {
		var transform3 = parentNode.createNode('transform');
		transform3.setName('transform3');
		const transform3_nodes: ReturnedNodeDataDict = {};
		transform3.uiData.setPosition(800, -150);
		transform3.p.applyOn.set(1);
		transform3.p.t.set([0, 1, 0]);
		transform3.params.postCreateSpareParams();
		transform3.params.runOnSceneLoadHooks();
		return {node: transform3, children: transform3_nodes};
	}
	function create_box2(parentNode: GeoObjNode) {
		var box2 = parentNode.createNode('box');
		box2.setName('box2');
		const box2_nodes: ReturnedNodeDataDict = {};
		box2.uiData.setPosition(1100, -300);
		box2.p.size.set(0.1);
		box2.params.postCreateSpareParams();
		box2.params.runOnSceneLoadHooks();
		return {node: box2, children: box2_nodes};
	}
	function create_actor4(parentNode: GeoObjNode) {
		var actor4 = parentNode.createNode('actor');
		actor4.setName('actor4');
		const actor4_nodes: ReturnedNodeDataDict = {};
		function create_getDefaultCamera1(actor4: ActorSopNode) {
			var getDefaultCamera1 = actor4.createNode('getDefaultCamera');
			getDefaultCamera1.setName('getDefaultCamera1');
			const getDefaultCamera1_nodes: ReturnedNodeDataDict = {};
			getDefaultCamera1.uiData.setPosition(-100, 300);
			getDefaultCamera1.params.postCreateSpareParams();
			getDefaultCamera1.params.runOnSceneLoadHooks();
			return {node: getDefaultCamera1, children: getDefaultCamera1_nodes};
		}
		function create_onTick1(actor4: ActorSopNode) {
			var onTick1 = actor4.createNode('onTick');
			onTick1.setName('onTick1');
			const onTick1_nodes: ReturnedNodeDataDict = {};
			onTick1.uiData.setPosition(-100, 0);
			onTick1.params.postCreateSpareParams();
			onTick1.params.runOnSceneLoadHooks();
			return {node: onTick1, children: onTick1_nodes};
		}
		function create_setObjectPosition1(actor4: ActorSopNode) {
			var setObjectPosition1 = actor4.createNode('setObjectPosition');
			setObjectPosition1.setName('setObjectPosition1');
			const setObjectPosition1_nodes: ReturnedNodeDataDict = {};
			setObjectPosition1.uiData.setPosition(400, 0);
			setObjectPosition1.params.postCreateSpareParams();
			setObjectPosition1.params.runOnSceneLoadHooks();
			return {node: setObjectPosition1, children: setObjectPosition1_nodes};
		}
		function create_vector3Unproject1(actor4: ActorSopNode) {
			var vector3Unproject1 = actor4.createNode('vector3Unproject');
			vector3Unproject1.setName('vector3Unproject1');
			const vector3Unproject1_nodes: ReturnedNodeDataDict = {};
			vector3Unproject1.uiData.setPosition(100, 300);
			vector3Unproject1.p.Vector3.set([0, 0, 0.7]);
			vector3Unproject1.params.postCreateSpareParams();
			vector3Unproject1.params.runOnSceneLoadHooks();
			return {node: vector3Unproject1, children: vector3Unproject1_nodes};
		}
		actor4_nodes['getDefaultCamera1'] = create_getDefaultCamera1(actor4);
		actor4_nodes['onTick1'] = create_onTick1(actor4);
		actor4_nodes['setObjectPosition1'] = create_setObjectPosition1(actor4);
		actor4_nodes['vector3Unproject1'] = create_vector3Unproject1(actor4);
		actor4_nodes['setObjectPosition1'].node.setInput('trigger', actor4_nodes['onTick1'].node, 'trigger');
		actor4_nodes['setObjectPosition1'].node.setInput(
			'position',
			actor4_nodes['vector3Unproject1'].node,
			'position'
		);
		actor4_nodes['vector3Unproject1'].node.setInput('Camera', actor4_nodes['getDefaultCamera1'].node, 'camera');
		if (actor4.childrenController) {
			actor4.childrenController.selection.set([actor4_nodes['vector3Unproject1'].node]);
		}
		actor4.uiData.setPosition(1100, -50);
		actor4.params.postCreateSpareParams();
		actor4.params.runOnSceneLoadHooks();
		return {node: actor4, children: actor4_nodes};
	}
	function create_merge2(parentNode: GeoObjNode) {
		var merge2 = parentNode.createNode('merge');
		merge2.setName('merge2');
		const merge2_nodes: ReturnedNodeDataDict = {};
		merge2.uiData.setPosition(900, 100);
		merge2.flags.display.set(true);
		merge2.params.postCreateSpareParams();
		merge2.params.runOnSceneLoadHooks();
		return {node: merge2, children: merge2_nodes};
	}
	cameras_nodes['perspectiveCamera3'] = create_perspectiveCamera3(parentNode);
	cameras_nodes['transform3'] = create_transform3(parentNode);
	cameras_nodes['box2'] = create_box2(parentNode);
	cameras_nodes['actor4'] = create_actor4(parentNode);
	cameras_nodes['merge2'] = create_merge2(parentNode);
	cameras_nodes['transform3'].node.setInput(0, cameras_nodes['perspectiveCamera3'].node);
	cameras_nodes['actor4'].node.setInput(0, cameras_nodes['box2'].node);
	cameras_nodes['merge2'].node.setInput(0, cameras_nodes['transform3'].node);
	cameras_nodes['merge2'].node.setInput(1, cameras_nodes['actor4'].node);
	return cameras_nodes;
}

QUnit.test('actor/Vector3Unproject', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const nodes = _createScene(geo1);
	const merge1 = nodes.merge2.node as MergeSopNode;
	// const actor1 = nodes.actor4.node as ActorSopNode;
	merge1.flags.display.set(true);
	const container = await merge1.compute();
	const object = container.coreContent()!.threejsObjects()[1] as Mesh;
	let currentCameraObject: PerspectiveCamera | undefined;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	scene.threejsScene().traverse((childObject) => {
		if ((childObject as PerspectiveCamera).isPerspectiveCamera) {
			currentCameraObject = childObject as PerspectiveCamera;
		}
	});
	if (!currentCameraObject) {
		assert.equal(1, 2, 'no camera found');
		return;
	}
	scene.root().mainCameraController.setCameraPath(`*/${currentCameraObject.name}`);

	const viewer = scene.viewersRegister.viewer({camera: currentCameraObject});
	if (!viewer) {
		assert.equal(1, 2, 'viewer not created');
		return;
	}
	await RendererUtils.withViewer({viewer: viewer as ThreejsViewer<PerspectiveCamera>, mount: true}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 0);
		assert.equal(object.position.y, 1);
		assert.in_delta(object.position.z, -0.6629, 0.01);
	});
});
