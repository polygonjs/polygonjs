import {WebGLRendererParameters} from 'three';

export enum PowerPreference {
	HIGH = 'high-performance',
	LOW = 'low-power',
	DEFAULT = 'default',
}
export const POWER_PREFERENCES: PowerPreference[] = [
	PowerPreference.HIGH,
	PowerPreference.LOW,
	PowerPreference.DEFAULT,
];

export enum RendererPrecision {
	HIGH = 'highp',
	MEDIUM = 'mediump',
	LOW = 'lowp',
}

export const RENDERER_PRECISIONS: RendererPrecision[] = [
	RendererPrecision.HIGH,
	RendererPrecision.MEDIUM,
	RendererPrecision.LOW,
];

export const WEBGL_RENDERER_DEFAULT_PARAMS: WebGLRendererParameters = {
	alpha: true,
	precision: RendererPrecision.HIGH,
	premultipliedAlpha: true,
	antialias: true,
	preserveDrawingBuffer: false,
	powerPreference: PowerPreference.DEFAULT,
	depth: true,
	stencil: true,
	logarithmicDepthBuffer: false,
};
