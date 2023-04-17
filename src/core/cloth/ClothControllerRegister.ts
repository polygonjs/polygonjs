import {Mesh, Object3D} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
// import {BaseNodeType} from '../../engine/nodes/_Base';
import {CoreObject} from '../geometry/Object';
import {ClothIdAttribute, ClothSolverAttribute} from './ClothAttribute';
import {ClothController} from './ClothController';

const clothControllerByGraphNodeId: Map<string, ClothController> = new Map();
export function createOrFindClothController(clothObject: Object3D) {
	// const nodeId = node.graphNodeId();
	let controller = clothControllerByGraphNodeId.get(clothObject.uuid);
	if (!controller) {
		if (!(clothObject instanceof Mesh)) {
			return;
		}
		controller = new ClothController(clothObject);
		clothControllerByGraphNodeId.set(clothObject.uuid, controller);

		const stepsCount = (CoreObject.attribValue(clothObject, ClothSolverAttribute.STEPS_COUNT) as number) || 5;
		controller.stepsCount = stepsCount;
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
