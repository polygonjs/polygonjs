import {CoreGraphNodeId} from '../graph/CoreGraph';
import {LineBasicMaterial, BufferGeometry, LineSegments, BufferAttribute, Object3D} from 'three';
import {CoreObject} from '../geometry/modules/three/CoreObject';
import {PhysicsIdAttribute} from './PhysicsAttribute';
import {physicsWorldFromNodeId} from './PhysicsWorld';
// interface PhysicsDebugPair {
// 	object: LineSegments;
// 	world: World;
// }
// const physicsDebugByGraphNodeId: Map<CoreGraphNodeId, PhysicsDebugPair> = new Map();

export function physicsCreateDebugObject() {
	return new LineSegments(
		new BufferGeometry(),
		new LineBasicMaterial({
			color: 0xffffff,
			vertexColors: true,
		})
	);
}
// export function createOrFindPhysicsDebugObject(node: BaseNodeType, world: World) {
// 	const nodeId = node.graphNodeId();
// 	let pair = physicsDebugByGraphNodeId.get(nodeId);
// 	if (!pair) {
// 		const debugObject = physicsCreateDebugObject();
// 		pair = {object: debugObject, world};
// 		physicsDebugByGraphNodeId.set(nodeId, pair);
// 	}

// 	CoreObject.addAttribute(pair.object, PhysicsIdAttribute.DEBUG, nodeId);
// 	return pair;
// }
// export function physicsDebugPairFromDebugObject(debugObject: Object3D) {
// 	const nodeId = CoreObject.attribValue(debugObject, PhysicsIdAttribute.DEBUG) as CoreGraphNodeId | undefined;
// 	if (nodeId == null) {
// 		return;
// 	}
// 	return physicsDebugByGraphNodeId.get(nodeId);
// }

export function updatePhysicsDebugObject(debugObject: Object3D) {
	const nodeId = CoreObject.attribValue(debugObject, PhysicsIdAttribute.DEBUG_WORLD) as CoreGraphNodeId | undefined;
	if (nodeId == null) {
		return;
	}
	const world = physicsWorldFromNodeId(nodeId);
	if (!world) {
		return;
	}
	const buffers = world.debugRender();
	const geometry = (debugObject as LineSegments).geometry;
	geometry.setAttribute('position', new BufferAttribute(buffers.vertices, 3));
	geometry.setAttribute('color', new BufferAttribute(buffers.colors, 4));
}
