export enum WebXRARFeature {
	HIT_TEST = 'hit-test',
	LIGHT_ESTIMATION = 'light-estimation',
}

export const WEBXR_AR_FEATURES: WebXRARFeature[] = [WebXRARFeature.HIT_TEST, WebXRARFeature.LIGHT_ESTIMATION];

export interface CoreWebXRARControllerOptions {
	optionalFeatures: WebXRARFeature[];
	requiredFeatures: WebXRARFeature[];
}

export interface ExtentedXRViewCamera {
	width: number;
	height: number;
}
export interface ExtentedXRView extends XRView {
	camera?: ExtentedXRViewCamera;
}
export abstract class ExtendedXRWebGLBinding extends XRWebGLBinding {
	abstract getCameraImage(camera: ExtentedXRViewCamera): any;
}
