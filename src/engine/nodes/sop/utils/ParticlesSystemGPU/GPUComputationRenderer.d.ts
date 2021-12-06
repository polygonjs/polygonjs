import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {DataTexture} from 'three/src/textures/DataTexture';
import {TextureDataType} from 'three/src/constants';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

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
