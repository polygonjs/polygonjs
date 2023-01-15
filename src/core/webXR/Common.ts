export enum BaseXRSessionEventName {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
	SELECT = 'select',
	SELECT_START = 'selectstart',
	SELECT_END = 'selectend',
}

export const BASE_XR_SESSION_EVENT_NAMES: BaseXRSessionEventName[] = [
	BaseXRSessionEventName.CONNECTED,
	BaseXRSessionEventName.DISCONNECTED,
	BaseXRSessionEventName.SELECT,
	BaseXRSessionEventName.SELECT_START,
	BaseXRSessionEventName.SELECT_END,
];
function _buildEventIndices() {
	const map: Map<BaseXRSessionEventName, number> = new Map();
	let i = 0;
	for (let eventName of BASE_XR_SESSION_EVENT_NAMES) {
		map.set(eventName, i);
		i++;
	}
	return map;
}
export const BASE_XR_EVENT_INDICES = _buildEventIndices();

export const WEBXR_REFERENCE_SPACE_TYPES: XRReferenceSpaceType[] = [
	'viewer',
	'local',
	'local-floor',
	'bounded-floor',
	'unbounded',
];
export const DEFAULT_WEBXR_REFERENCE_SPACE_TYPE: XRReferenceSpaceType = 'local-floor';

export type WebXRRenderFunction = () => void;
export type WebXRControllerMountFunction = () => void;
export type WebXRControllerUnmountFunction = () => void;

export enum WebXRFeatureStatus {
	NOT_USED = 'not used',
	OPTIONAL = 'optional',
	REQUIRED = 'required',
}
export const WEBXR_FEATURE_STATUSES: WebXRFeatureStatus[] = [
	WebXRFeatureStatus.NOT_USED,
	WebXRFeatureStatus.OPTIONAL,
	WebXRFeatureStatus.REQUIRED,
];
export const WEBXR_FEATURE_STATUS_OPTIONAL_INDEX = WEBXR_FEATURE_STATUSES.indexOf(WebXRFeatureStatus.OPTIONAL);
export const WEBXR_FEATURE_PARAM_OPTIONS = {
	menu: {
		entries: WEBXR_FEATURE_STATUSES.map((name, value) => ({name, value})),
	},
};

export interface CoreWebXRControllerOptions {
	overrideReferenceSpaceType: boolean;
	referenceSpaceType?: XRReferenceSpaceType;
}
