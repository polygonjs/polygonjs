import {CoreWebXRControllerOptions} from '../Common';

export enum WebXRARFeature {
	HIT_TEST = 'hit-test',
	LIGHT_ESTIMATION = 'light-estimation',
	// CAMERA_ACCESS = 'camera-access',
}

export const WEBXR_AR_FEATURES: WebXRARFeature[] = [
	WebXRARFeature.HIT_TEST,
	WebXRARFeature.LIGHT_ESTIMATION,
	// WebXRARFeature.CAMERA_ACCESS,
];

export interface CoreWebXRARControllerOptions extends CoreWebXRControllerOptions {
	optionalFeatures: WebXRARFeature[];
	requiredFeatures: WebXRARFeature[];
}

// https://immersive-web.github.io/raw-camera-access/#xrcamera
export interface XRCamera {
	width: number;
	height: number;
}
export interface ExtentedXRView extends XRView {
	camera?: XRCamera;
}
export abstract class ExtendedXRWebGLBinding extends XRWebGLBinding {
	abstract getCameraImage(camera: XRCamera): WebGLTexture | undefined;
}
