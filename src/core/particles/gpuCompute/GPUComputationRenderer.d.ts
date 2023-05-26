import type {ShaderMaterial, TextureDataType, DataTexture, WebGLRenderTarget, Texture} from 'three';
import {AbstractRenderer} from '../../../engine/viewers/Common';
import {Ref} from '@vue/reactivity';
export type GPUComputationConfigRef = Record<string, Ref<Texture>>;
export type GPUComputationConfigRefString = Record<keyof GPUComputationConfigRef, string>;
export interface GPUComputationRendererVariable {
	name: string;
	renderTargets: WebGLRenderTarget[];
	material: ShaderMaterial;
}

export class GPUComputationRenderer {
	constructor(x: number, y: number, renderer: AbstractRenderer);
	compute(configRef: GPUComputationConfigRef): void;
	init(): GPUComputationConfigRef | undefined;
	dispose(): void;
	setDataType(type: TextureDataType): void;
	addVariable(name: string, fragment_shader: string, variable: DataTexture): GPUComputationRendererVariable;
	setVariableDependencies(variable: GPUComputationRendererVariable, vars: GPUComputationRendererVariable[]): void;
	renderTexture(texture: DataTexture, render_target: WebGLRenderTarget): void;
	createTexture(): DataTexture;
	getCurrentRenderTarget(variable: GPUComputationRendererVariable): WebGLRenderTarget;
}
