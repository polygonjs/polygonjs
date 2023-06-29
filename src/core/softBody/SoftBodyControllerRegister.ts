import {Object3D, Vector3} from 'three';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {CoreObject} from '../geometry/Object';
import {CoreSoftBodyAttribute, SoftBodyIdAttribute} from './SoftBodyAttribute';
import {SoftBodyController} from './SoftBodyController';
import type {PolyScene} from '../../engine/scene/PolyScene';
import type {TetSoftBodySolverSopNode} from '../../engine/nodes/sop/TetSoftBodySolver';
import {SoftBody} from './SoftBody';
import {TetEmbed} from './Common';

const controllers: WeakMap<Object3D, SoftBodyController> = new WeakMap();
const softBodies: WeakMap<Object3D, SoftBody> = new WeakMap();
const gravity = new Vector3();

interface CreateOrFindSoftBodyControllerOptions {
	tetEmbed: TetEmbed;
	threejsObjectInSceneTree: Object3D;
}

export function createOrFindSoftBodyController(
	scene: PolyScene,
	node: TetSoftBodySolverSopNode,
	options: CreateOrFindSoftBodyControllerOptions
) {
	const {tetEmbed, threejsObjectInSceneTree} = options;
	const {highResObject} = tetEmbed;
	// update tetEmbed before passing it to the other functions
	if (highResObject) {
		tetEmbed.highResObject = threejsObjectInSceneTree;
		tetEmbed.threejsObjectInSceneTree = threejsObjectInSceneTree;
	} else {
		tetEmbed.lowResObject = threejsObjectInSceneTree;
		tetEmbed.threejsObjectInSceneTree = threejsObjectInSceneTree;
	}
	//
	let controller = controllers.get(threejsObjectInSceneTree);
	if (!controller) {
		// const subSteps = CoreSoftBodyAttribute.getSubSteps(threejsObject);
		// console.log({subSteps});
		CoreSoftBodyAttribute.getGravity(threejsObjectInSceneTree, gravity);
		controller = new SoftBodyController(scene, {
			node,
			gravity,
			// subSteps,
		});
		controllers.set(threejsObjectInSceneTree, controller);
		const {softBody} = createOrFindSoftBody(node, tetEmbed);
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
export function createOrFindSoftBody(node: TetSoftBodySolverSopNode, tetEmbed: TetEmbed) {
	const {threejsObjectInSceneTree} = tetEmbed;
	if (!threejsObjectInSceneTree) {
		throw 'createOrFindSoftBody: threejsObjectInSceneTree is null';
	}
	let softBody = softBodies.get(threejsObjectInSceneTree);
	if (!softBody) {
		const edgeCompliance = CoreSoftBodyAttribute.getEdgeCompliance(threejsObjectInSceneTree);
		const volumeCompliance = CoreSoftBodyAttribute.getVolumeCompliance(threejsObjectInSceneTree);
		const highResSkinningLookupSpacing =
			CoreSoftBodyAttribute.getHighResSkinningLookupSpacing(threejsObjectInSceneTree);
		const highResSkinningLookupPadding =
			CoreSoftBodyAttribute.getHighResSkinningLookupPadding(threejsObjectInSceneTree);

		// if ((softBodyObject as Mesh).isMesh) {
		// const mesh = softBodyObject as Mesh;
		softBody = new SoftBody({
			node,
			tetEmbed,
			edgeCompliance,
			volumeCompliance,
			highResSkinning: {
				lookup: {
					spacing: highResSkinningLookupSpacing,
					padding: highResSkinningLookupPadding,
				},
			},
		});
		softBodies.set(threejsObjectInSceneTree, softBody);
		// }
	}

	return {softBody};
}
export function softBodyControllerNodeIdFromObject(softBodyObject: Object3D) {
	const nodeId = CoreObject.attribValue(softBodyObject, SoftBodyIdAttribute.SOLVER_NODE) as
		| CoreGraphNodeId
		| undefined;
	return nodeId;
}

export function softBodyControllerFromObject(softBodyObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return controllers.get(softBodyObject);
}
export function softBodyFromObject(softBodyObject: Object3D) {
	// const nodeId = CoreObject.attribValue(clothObject, ClothIdAttribute.OBJECT) as CoreGraphNodeId | undefined;
	// if (nodeId == null) {
	// 	return;
	// }
	return softBodies.get(softBodyObject);
}
