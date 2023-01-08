import {Camera, Scene} from 'three';

export type ARjsControllerRenderFunction = () => void;
export type ARjsControllerMountFunction = () => void;
export type ARjsControllerUnmountFunction = () => void;
// export type ARjsControllerResizeFunction = () => void;

export interface CoreCameraARjsControllerConfig {
	renderFunction: ARjsControllerRenderFunction;
	mountFunction: ARjsControllerMountFunction;
	unmountFunction: ARjsControllerUnmountFunction;
	// resizeFunction: ARjsControllerResizeFunction;
}

export interface CoreARjsControllerOptions {
	// renderer: WebGLRenderer;
	camera: Camera;
	scene: Scene;
	// onResize: () => void;
}
