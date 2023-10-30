import type {Ref} from '@vue/reactivity';
import {Intersection, Material} from 'three';

export interface PriorityOptions {
	blockObjectsBehind: boolean;
	skipIfObjectsInFront: boolean;
}
export interface CPUOptions {
	traverseChildren: boolean;
	pointsThreshold: number;
	lineThreshold: number;
	intersectionRef: Ref<Intersection | null>;
}
export interface GPUOptions {
	// if a worldPosMaterial is given, we use it and only need a single render call.
	// if not, we render need 2 renders, 1 to write to the depth buffer and another to read it (in addition to readRenderTargetPixels)
	worldPosMaterial: Material | null;
	distanceRef: Ref<number>;
}
export interface ObjectOptions {
	priority: PriorityOptions;
	cpu?: CPUOptions;
	gpu?: GPUOptions;
}

export function hasCPUOptions(optionsList: ObjectOptions[]): boolean {
	for (const options of optionsList) {
		if (options.cpu != null) {
			return true;
		}
	}
	return false;
}
export function hasGPUOptions(optionsList: ObjectOptions[]): boolean {
	for (const options of optionsList) {
		if (options.gpu != null) {
			return true;
		}
	}
	return false;
}
export function GPUOptionsDepthBufferRequired(optionsList: ObjectOptions[]): boolean {
	for (const options of optionsList) {
		if (options.gpu != null && options.gpu.worldPosMaterial == null) {
			return true;
		}
	}
	return false;
}
function _cpuOptionsEqual(options1: CPUOptions, options2: CPUOptions): boolean {
	return (
		options1.traverseChildren == options2.traverseChildren &&
		options1.pointsThreshold == options2.pointsThreshold &&
		options1.lineThreshold == options2.lineThreshold
	);
}

export function CPUOptionsEqual(optionsList: ObjectOptions[]): boolean {
	let firstCPUOptions: CPUOptions | undefined;
	for (const options of optionsList) {
		if (options.cpu != null) {
			if (firstCPUOptions == null) {
				firstCPUOptions = options.cpu;
			} else {
				if (!_cpuOptionsEqual(firstCPUOptions, options.cpu)) {
					return false;
				}
			}
		}
	}
	return true;
}

export function CPUOptionsMax(optionsList: ObjectOptions[], target: CPUOptions): CPUOptions {
	target.traverseChildren = false;
	target.pointsThreshold = -1;
	target.lineThreshold = -1;
	for (const options of optionsList) {
		if (options.cpu != null) {
			if (target.traverseChildren == false && options.cpu.traverseChildren == true) {
				target.traverseChildren = options.cpu.traverseChildren;
			}
			if (target.pointsThreshold < options.cpu.pointsThreshold) {
				target.pointsThreshold = options.cpu.pointsThreshold;
			}
			if (target.lineThreshold < options.cpu.lineThreshold) {
				target.lineThreshold = options.cpu.lineThreshold;
			}
		}
	}
	return target;
}
