export enum WebXRARFeature {
	HIT_TEST = 'hit-test',
	LIGHT_ESTIMATION = 'light-estimation',
}

export const WEBXR_AR_FEATURES: WebXRARFeature[] = [WebXRARFeature.HIT_TEST, WebXRARFeature.LIGHT_ESTIMATION];

export interface CoreWebXRARControllerOptions {
	optionalFeatures: WebXRARFeature[];
	requiredFeatures: WebXRARFeature[];
}
