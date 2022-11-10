import {Object3D} from 'three';
import {PolyScene} from '../../../scene/PolyScene';
import {BaseActorNodeType} from '../../../nodes/actor/_Base';
import {ActorBuilderNode} from '../ActorsManager';

export function outputValueForFirstObject(node: BaseActorNodeType, outputName: string = '') {
	let matchedObject: Object3D | undefined;
	const scene = node.scene();
	const actorsManager = scene.actorsManager;
	const parentNode = actorsManager.parentActorBuilderNode(node);
	scene.threejsScene().traverse((object) => {
		const nodeIds = actorsManager.objectActorNodeIds(object);
		if (!parentNode) {
			return;
		}
		if (!nodeIds) {
			return;
		}
		if (!nodeIds.includes(parentNode.graphNodeId())) {
			return;
		}
		matchedObject = object;
	});
	if (!matchedObject) {
		return;
	}
	return node.outputValue({Object3D: matchedObject}, outputName);
}

export function objectsForActorNode(node: BaseActorNodeType) {
	const matchedObjects: Object3D[] = [];
	const scene = node.scene();
	const actorsManager = scene.actorsManager;
	const parentNode = actorsManager.parentActorBuilderNode(node);
	scene.threejsScene().traverse((object) => {
		const nodeIds = actorsManager.objectActorNodeIds(object);
		if (!parentNode) {
			return;
		}
		if (!nodeIds) {
			return;
		}
		if (!nodeIds.includes(parentNode.graphNodeId())) {
			return;
		}
		matchedObjects.push(object);
	});

	return matchedObjects;
}

export function actorNodesForObject(object: Object3D, scene: PolyScene) {
	const actorsManager = scene.actorsManager;
	const nodeIds = actorsManager.objectActorNodeIds(object);
	if (!nodeIds) {
		return;
	}

	const actorBuilderNodes = nodeIds
		.map((nodeId) => scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
		.filter((node) => node);
	return actorBuilderNodes;
}
