import {Object3D} from 'three';
import {CoreParticlesController} from './CoreParticlesController';
import {CoreParticlesAttribute} from './CoreParticlesAttribute';
import type {PolyScene} from '../../engine/scene/PolyScene';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {ParticlesSystemGpuSopNode} from '../../engine/nodes/sop/ParticlesSystemGpu';
import {AbstractRenderer} from '../../engine/viewers/Common';

const coreParticlesControllerByNodeId: Map<CoreGraphNodeId, CoreParticlesController> = new Map();
const rendererByNodeId: Map<CoreGraphNodeId, AbstractRenderer> = new Map();
export async function createOrFindParticlesController(object: Object3D, scene: PolyScene) {
	const nodeId = CoreParticlesAttribute.getParticlesNodeId(object);

	// using a particlesSystemId attribute,
	// we could use multiple particle system per node.
	// But for now, we only have one and re-use it
	let controller = coreParticlesControllerByNodeId.get(nodeId);
	if (!controller) {
		const node = scene.graph.nodeFromId(nodeId) as ParticlesSystemGpuSopNode;
		if (node) {
			controller = new CoreParticlesController(scene, node);
			coreParticlesControllerByNodeId.set(nodeId, controller);
		}
	}
	if (controller) {
		const renderer = rendererByNodeId.get(nodeId);
		if (renderer) {
			controller.init(object, renderer);
		}
	}
}
export function setParticleRenderer(nodeId: CoreGraphNodeId, renderer: AbstractRenderer) {
	rendererByNodeId.set(nodeId, renderer);
}
export function stepParticles(object: Object3D, delta: number) {
	coreParticlesControllerFromObject(object)?.stepSimulation(delta);
}
export function resetParticles(object: Object3D) {
	coreParticlesControllerFromObject(object)?.reset();
}
export function disposeParticlesFromNode(node: ParticlesSystemGpuSopNode) {
	const nodeId = node.graphNodeId();
	const controller = coreParticlesControllerByNodeId.get(nodeId);
	controller?.dispose();
	coreParticlesControllerByNodeId.delete(nodeId);
}

// utils
function coreParticlesControllerFromObject(object: Object3D) {
	const nodeId = CoreParticlesAttribute.getParticlesNodeId(object);
	return coreParticlesControllerByNodeId.get(nodeId);
}

export function coreParticlesControllerFromNode(node: ParticlesSystemGpuSopNode) {
	return coreParticlesControllerByNodeId.get(node.graphNodeId());
}
export function gpuControllerFromNode(node: ParticlesSystemGpuSopNode) {
	return coreParticlesControllerFromNode(node)?.gpuController;
}
export function renderControllerFromNode(node: ParticlesSystemGpuSopNode) {
	return coreParticlesControllerFromNode(node)?.renderController;
}
