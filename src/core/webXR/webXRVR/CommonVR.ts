import {CoreWebXRControllerOptions} from '../Common';

export enum WebXRVRFeature {
	LOCAL_FLOOR = 'local-floor',
	BOUNDED_FLOOR = 'bounded-floor',
	HAND_TRACKING = 'hand-tracking',
	LAYERS = 'layers',
}

export const WEBXR_VR_FEATURES: WebXRVRFeature[] = [
	WebXRVRFeature.LOCAL_FLOOR,
	WebXRVRFeature.BOUNDED_FLOOR,
	WebXRVRFeature.HAND_TRACKING,
	WebXRVRFeature.LAYERS,
];

export interface CoreWebXRVRControllerOptions extends CoreWebXRControllerOptions {
	requiredFeatures: WebXRVRFeature[];
	optionalFeatures: WebXRVRFeature[];
}
