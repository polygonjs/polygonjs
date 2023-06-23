import {Object3D} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {CoreObject} from '../geometry/Object';
import {SoftBodyIdAttribute} from './SoftBodyAttribute';
import {SoftBodyController} from './SoftBodyController';
import type {PolyScene} from '../../engine/scene/PolyScene';
import type {TetSoftBodySolverSopNode} from '../../engine/nodes/sop/TetSoftBodySolver';
import {SoftBody, TetAndThreejsPair} from './SoftBody';

const controllers: WeakMap<Object3D, SoftBodyController> = new WeakMap();
const softBodies: WeakMap<Object3D, SoftBody> = new WeakMap();

export function createOrFindSoftBodyController(
	scene: PolyScene,
	node: TetSoftBodySolverSopNode,
	pair: TetAndThreejsPair
) {
	const {threejsObject} = pair;
	let controller = controllers.get(threejsObject);
	if (!controller) {
		controller = new SoftBodyController(scene, node);
		controllers.set(threejsObject, controller);
		const {softBody} = createOrFindSoftBody(scene, pair);
		if (softBody) {
			controller.addSoftBody(softBody);
		} else {
			console.warn('no softbody found');
		}
		// const children = tetObject.children;
		// for (const child of children) {
		// 	if ((child as Mesh).isMesh) {
		// 		const {softBody} = createOrFindSoftBody(scene, child);
		// 		if (softBody) {
		// 			controller.addSoftBody(softBody);
		// 		}
		// 	}
		// }
	}

	return {controller};
}
export function createOrFindSoftBody(scene: PolyScene, pair: TetAndThreejsPair) {
	const {threejsObject} = pair;
	let softBody = softBodies.get(threejsObject);
	if (!softBody) {
		// if ((softBodyObject as Mesh).isMesh) {
		// const mesh = softBodyObject as Mesh;
		softBody = new SoftBody({
			pair,
			// bufferGeometry: mesh.geometry,
			// edgeCompliance?: number;
			// volCompliance?: number;
		});
		softBodies.set(threejsObject, softBody);
		// }
	}

	return {softBody};
}
export function softBodyControllerNodeIdFromObject(threejsObject: Object3D) {
	const nodeId = CoreObject.attribValue(threejsObject, SoftBodyIdAttribute.SOLVER_NODE) as
		| CoreGraphNodeId
		| undefined;
	return nodeId;
}

export function softBodyControllerFromObject(threejsObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return controllers.get(threejsObject);
}
export function softBodyFromObject(threejsObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return softBodies.get(threejsObject);
}
