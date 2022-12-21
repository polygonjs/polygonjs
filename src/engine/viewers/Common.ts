// import type {Scene, Camera, Object3D, WebGLRenderTarget, WebGLMultipleRenderTargets, WebGLCapabilities} from 'three';
import type {WebGLRenderer} from 'three';
// const renderer = new WebGLRenderer();
// renderer.setRenderTarget;

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

// export interface AbstractRenderer {
// 	domElement: WebGLRenderer['domElement'];
// 	render: WebGLRenderer['render'];
// 	getPixelRatio(): number;
// 	compile(scene: Object3D, camera: Camera): void;
// 	dispose(): void;
// 	setSize(x: number, y: number, setStyle: boolean): void;
// 	setRenderTarget(
// 		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets | null,
// 		activeCubeFace?: number | undefined,
// 		activeMipmapLevel?: number | undefined
// 	): void;
// 	readRenderTargetPixels(
// 		renderTarget: WebGLRenderTarget | WebGLMultipleRenderTargets,
// 		x: number,
// 		y: number,
// 		width: number,
// 		height: number,
// 		buffer: Float32Array,
// 		activeCubeFaceIndex?: number | undefined
// 	): void;
// 	get capabilities(): WebGLCapabilities;
// }
