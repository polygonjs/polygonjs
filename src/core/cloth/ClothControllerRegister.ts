import {Mesh, Object3D} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {CoreObject} from '../geometry/modules/three/CoreObject';
import {ClothIdAttribute} from './ClothAttribute';
import {ClothController} from './ClothController';
import type {PolyScene} from '../../engine/scene/PolyScene';
import type {ClothSolverSopNode} from '../../engine/nodes/sop/ClothSolver';

const clothControllerByGraphNodeId: Map<string, ClothController> = new Map();
export function createOrFindClothController(scene: PolyScene, node: ClothSolverSopNode, clothObject: Object3D) {
	let controller = clothControllerByGraphNodeId.get(clothObject.uuid);
	if (!controller) {
		if (!(clothObject instanceof Mesh)) {
			return;
		}
		controller = new ClothController(scene, node, clothObject);
		clothControllerByGraphNodeId.set(clothObject.uuid, controller);
	}

	return {controller};
}
export function clothControllerNodeIdFromObject(clothObject: Object3D) {
	const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	return nodeId;
}

export function clothControllerFromObject(clothObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return clothControllerByGraphNodeId.get(clothObject.uuid);
}
