import type {WebGLRenderer} from 'three';

export type AbstractRenderer = Pick<
	WebGLRenderer,
	| 'domElement'
	| 'render'
	| 'getPixelRatio'
	| 'compile'
	| 'dispose'
	| 'setSize'
	| 'setRenderTarget'
	| 'readRenderTargetPixels'
	| 'capabilities'
>;
