import type {ShaderMaterial, TextureDataType, DataTexture, WebGLRenderTarget, WebGLRenderer} from 'three';

export interface GPUComputationRendererVariable {
	name: string;
	renderTargets: WebGLRenderTarget[];
	material: ShaderMaterial;
}

export class GPUComputationRenderer {
	constructor(x: number, y: number, renderer: WebGLRenderer);
	compute(): void;
	init(): string | null;
	dispose(): void;
	setDataType(type: TextureDataType): void;
	addVariable(name: string, fragment_shader: string, variable: DataTexture): GPUComputationRendererVariable;
	setVariableDependencies(variable: GPUComputationRendererVariable, vars: GPUComputationRendererVariable[]): void;
	renderTexture(texture: DataTexture, render_target: WebGLRenderTarget): void;
	createTexture(): DataTexture;
	getCurrentRenderTarget(variable: GPUComputationRendererVariable): WebGLRenderTarget;
}
