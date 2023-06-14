import {Mesh, Object3D} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {CoreObject} from '../geometry/Object';
import {SoftBodyIdAttribute} from './SoftBodyAttribute';
import {SoftBodyController} from './SoftBodyController';
import type {PolyScene} from '../../engine/scene/PolyScene';
import type {SoftBodySolverSopNode} from '../../engine/nodes/sop/SoftBodySolver';
import {SoftBody} from './SoftBody';
import {bunnyMesh} from './Bunny';

const controllers: Map<string, SoftBodyController> = new Map();
const softBodies: Map<string, SoftBody> = new Map();
export function createOrFindSoftBodyController(scene: PolyScene, node: SoftBodySolverSopNode, solverObject: Object3D) {
	let controller = controllers.get(solverObject.uuid);
	if (!controller) {
		controller = new SoftBodyController(scene, node);
		controllers.set(solverObject.uuid, controller);
		const children = solverObject.children;
		for (const child of children) {
			if ((child as Mesh).isMesh) {
				const {softBody} = createOrFindSoftBody(scene, child);
				if (softBody) {
					controller.addSoftBody(softBody);
				}
			}
		}
	}

	return {controller};
}
export function createOrFindSoftBody(scene: PolyScene, softBodyObject: Object3D) {
	let softBody = softBodies.get(softBodyObject.uuid);
	if (!softBody) {
		if ((softBodyObject as Mesh).isMesh) {
			const mesh = softBodyObject as Mesh;
			softBody = new SoftBody({
				tetMesh: bunnyMesh,
				bufferGeometry: mesh.geometry,
				// edgeCompliance?: number;
				// volCompliance?: number;
			});
			softBodies.set(mesh.uuid, softBody);
		}
	}

	return {softBody};
}
export function softBodyControllerNodeIdFromObject(solverObject: Object3D) {
	const nodeId = CoreObject.attribValue(solverObject, SoftBodyIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	return nodeId;
}

export function softBodyControllerFromObject(solverObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return controllers.get(solverObject.uuid);
}
export function softBodyFromObject(softBodyObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return softBodies.get(softBodyObject.uuid);
}
