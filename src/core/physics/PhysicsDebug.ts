import type {World} from '@dimforge/rapier3d';
import {Object3D} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {LineBasicMaterial, BufferGeometry, LineSegments, BufferAttribute} from 'three';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {CoreObject} from '../geometry/Object';
import {PhysicsIdAttribute} from './PhysicsAttribute';
interface PhysicsDebugPair {
	object: LineSegments;
	world: World;
}
const physicsDebugByGraphNodeId: Map<CoreGraphNodeId, PhysicsDebugPair> = new Map();

export function createOrFindPhysicsDebugObject(node: BaseNodeType, world: World) {
	const nodeId = node.graphNodeId();
	let pair = physicsDebugByGraphNodeId.get(nodeId);
	if (!pair) {
		const debugObject = new LineSegments(
			new BufferGeometry(),
			new LineBasicMaterial({
				color: 0xffffff,
				vertexColors: true,
			})
		);
		pair = {object: debugObject, world};
		physicsDebugByGraphNodeId.set(nodeId, pair);
	}

	CoreObject.addAttribute(pair.object, PhysicsIdAttribute.DEBUG, nodeId);
	return pair;
}
export function physicsDebugPairFromDebugObject(worldObject: Object3D) {
	const nodeId = CoreObject.attribValue(worldObject, PhysicsIdAttribute.DEBUG) as CoreGraphNodeId | undefined;
	if (nodeId == null) {
		return;
	}
	return physicsDebugByGraphNodeId.get(nodeId);
}

export function updatePhysicsDebugObject(pair: PhysicsDebugPair) {
	const buffers = pair.world.debugRender();
	const geometry = pair.object.geometry;
	geometry.setAttribute('position', new BufferAttribute(buffers.vertices, 3));
	geometry.setAttribute('color', new BufferAttribute(buffers.colors, 4));
}
