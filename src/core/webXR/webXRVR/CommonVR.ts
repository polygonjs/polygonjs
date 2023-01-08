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

export const XR_REFERENCE_SPACE_TYPES: XRReferenceSpaceType[] = [
	'viewer',
	'local',
	'local-floor',
	'bounded-floor',
	'unbounded',
];
export const DEFAULT_XR_REFERENCE_SPACE_TYPE: XRReferenceSpaceType = 'local-floor';

export interface CoreWebXRVRControllerOptions {
	overrideReferenceSpaceType: boolean;
	referenceSpaceType?: XRReferenceSpaceType;
	requiredFeatures: WebXRVRFeature[];
	optionalFeatures: WebXRVRFeature[];
}
