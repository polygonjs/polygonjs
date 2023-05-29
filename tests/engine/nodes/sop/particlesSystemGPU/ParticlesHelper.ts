import {ParticlesSystemGpuSopNode} from '../../../../../src/engine/nodes/sop/ParticlesSystemGpu';
import {CoreParticlesGpuComputeController} from '../../../../../src/core/particles/CoreParticlesGpuComputeController';
import {CoreParticlesRenderController} from '../../../../../src/core/particles/CoreParticlesRenderController';
import {
	gpuControllerFromNode,
	renderControllerFromNode,
	coreParticlesControllerFromNode,
} from '../../../../../src/core/particles/CoreParticles';
import {GeoObjNode} from '../../../../../src/engine/nodes/obj/Geo';
import {ActorSopNode} from '../../../../../src/engine/nodes/sop/Actor';
import {JsConnectionPointType} from '../../../../../src/engine/nodes/utils/io/connections/Js';
import {CoreSleep} from '../../../../../src/core/Sleep';
import {GPUComputationConfigRef} from '../../../../../src/core/particles/gpuCompute/GPUComputationRenderer';
export function createActorNodeChildren(actorNode: ActorSopNode) {
	const particlesSystemReset = actorNode.createNode('particlesSystemReset');
	const onScenePause = actorNode.createNode('onScenePause');
	const particlesSystemStepSimulation = actorNode.createNode('particlesSystemStepSimulation');
	const onTick = actorNode.createNode('onTick');

	particlesSystemReset.setInput(0, onScenePause);
	particlesSystemStepSimulation.setInput(JsConnectionPointType.TRIGGER, onTick);

	onScenePause.uiData.setPosition(-100, -100);
	particlesSystemReset.uiData.setPosition(100, -100);
	onTick.uiData.setPosition(-100, 100);
	particlesSystemStepSimulation.uiData.setPosition(100, 100);

	return {particlesSystemStepSimulation};
}
export function createRequiredNodesForParticles(particles1: ParticlesSystemGpuSopNode) {
	// create output and globals
	const output1 = particles1.createNode('output');
	const globals1 = particles1.createNode('globals');
	// create material
	const MAT = window.MAT;
	const pointsBuilder1 = MAT.createNode('pointsBuilder');
	pointsBuilder1.createNode('output');
	particles1.p.material.set(pointsBuilder1.path());

	// actor
	const parent = particles1.parent()! as GeoObjNode;
	const actor1 = parent.createNode('actor');
	const actorChildren = createActorNodeChildren(actor1);
	const existingInput = particles1.io.inputs.input(0);
	actor1.setInput(0, existingInput);
	particles1.setInput(0, actor1);

	return {output1, globals1, pointsBuilder1, actor1, actorChildren};
}

export async function waitForParticlesComputedAndMounted(node: ParticlesSystemGpuSopNode) {
	node.flags.display.set(true);
	await node.compute();
	await CoreSleep.sleep(50);
}

export async function resetParticles(node: ParticlesSystemGpuSopNode) {
	return await coreParticlesControllerFromNode(node)?.reset();
	// await node.p.reset.pressButton();
}
export async function stepParticlesSimulation(node: ParticlesSystemGpuSopNode, configRef: GPUComputationConfigRef) {
	coreParticlesControllerFromNode(node)?.stepSimulation(1 / 60, configRef);
	// await node.p.reset.pressButton();
}

export async function setParticlesActive(node: ParticlesSystemGpuSopNode, state: boolean) {
	// node.p.active.set(state);
}
export function gpuController(node: ParticlesSystemGpuSopNode): CoreParticlesGpuComputeController {
	return gpuControllerFromNode(node)!;
}
export function renderController(node: ParticlesSystemGpuSopNode): CoreParticlesRenderController {
	return renderControllerFromNode(node)!;
}

export function roundPixelBuffer(pixelBuffer: Float32Array) {
	const rounded: number[] = [];
	pixelBuffer.forEach((n) => {
		rounded.push(Math.round(n));
	});
	return rounded.join(':');
}
export function joinArray(array: Array<string | number>) {
	return array.join(':');
}
