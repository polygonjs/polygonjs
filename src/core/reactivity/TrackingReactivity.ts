import {Object3D} from 'three';
import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';

const refByObjectUuid: Map<string, Ref<number>> = new Map();

export function getOrCreateTrackedObjectRef(object3D: Object3D) {
	return getTrackedObjectRef(object3D) || createRef(object3D);
}
function createRef(object3D: Object3D) {
	let _ref = refByObjectUuid.get(object3D.uuid);
	if (!_ref) {
		_ref = ref(0);
		refByObjectUuid.set(object3D.uuid, _ref);
	}
	return _ref;
}
function getTrackedObjectRef(object3D: Object3D) {
	return refByObjectUuid.get(object3D.uuid);
}

export function touchTrackedObject(object3D: Object3D) {
	const _ref = getTrackedObjectRef(object3D);
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}
