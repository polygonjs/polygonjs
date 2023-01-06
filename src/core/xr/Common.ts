import type {WebGLRenderer} from 'three';
import type {ARButtonSessionInit} from 'three/examples/jsm/webxr/ARButton';
export interface BaseXRButton {
	createButton: (renderer: WebGLRenderer, sessionInit?: Partial<ARButtonSessionInit>) => HTMLElement;
}

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
