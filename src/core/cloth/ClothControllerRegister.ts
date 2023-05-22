import {Mesh, Object3D} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
// import {BaseNodeType} from '../../engine/nodes/_Base';
import {CoreObject} from '../geometry/Object';
import {ClothIdAttribute} from './ClothAttribute';
import {ClothController} from './ClothController';
import {PolyScene} from '../../engine/scene/PolyScene';

const clothControllerByGraphNodeId: Map<string, ClothController> = new Map();
export function createOrFindClothController(scene: PolyScene, clothObject: Object3D) {
	// const nodeId = node.graphNodeId();
	let controller = clothControllerByGraphNodeId.get(clothObject.uuid);
	if (!controller) {
		if (!(clothObject instanceof Mesh)) {
			return;
		}
		controller = new ClothController(scene, clothObject);
		clothControllerByGraphNodeId.set(clothObject.uuid, controller);

		// const stepsCount = (CoreObject.attribValue(clothObject, ClothSolverAttribute.STEPS_COUNT) as number) || 5;
		// controller.stepsCount = stepsCount;
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
