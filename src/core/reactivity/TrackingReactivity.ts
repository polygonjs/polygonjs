import {Object3D} from 'three';
import {Ref} from '@vue/reactivity';
import {ref} from '../../core/reactivity/CoreReactivity';
import {TimeController} from '../../engine/scene/utils/TimeController';

const refByObjectUuid: Map<string, Ref<number>> = new Map();

export function getOrCreateTrackedObjectRef(timeController: TimeController, object3D: Object3D) {
	return getTrackedObjectRef(timeController, object3D) || createRef(object3D);
}
function createRef(object3D: Object3D) {
	let _ref = refByObjectUuid.get(object3D.uuid);
	if (!_ref) {
		_ref = ref(0);
		refByObjectUuid.set(object3D.uuid, _ref);
	}
	return _ref;
}
function getTrackedObjectRef(timeController: TimeController, object3D: Object3D) {
	return timeController.timeUniform();
	// return refByObjectUuid.get(object3D.uuid);
}

export function touchTrackedObject(object3D: Object3D) {
	// const _ref = getTrackedObjectRef(object3D);
	// if (!_ref) {
	// 	return;
	// }
	// incrementRefSafely(_ref);
}
