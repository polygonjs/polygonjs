import {Object3D} from 'three';
import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from './CoreReactivity';

const refByObjectUuidByUserDataName: Map<string, Map<string, Ref<number>>> = new Map();

export function getOrCreateUserDataRef(object3D: Object3D, userDataName: string) {
	return getObjectUserDataRef(object3D, userDataName) || _createObjectUserDataRef(object3D, userDataName);
}
function getObjectUserDataRef(object3D: Object3D, userDataName: string) {
	return refByObjectUuidByUserDataName.get(object3D.uuid)?.get(userDataName);
}
export function _createObjectUserDataRef(object3D: Object3D, userDataName: string) {
	let mapForObject = refByObjectUuidByUserDataName.get(object3D.uuid);
	if (!mapForObject) {
		mapForObject = new Map();
		refByObjectUuidByUserDataName.set(object3D.uuid, mapForObject);
	}
	let refForProperty = mapForObject.get(userDataName);
	if (!refForProperty) {
		refForProperty = ref(0);
		mapForObject.set(userDataName, refForProperty);
	}
	return refForProperty;
}
export function _dummyReadUserDataRefVal(value: number) {
	// we just need this method to force a call to .value
	// and ensure that we have a dependency with the ref()
}

export function touchObjectUserData(object3D: Object3D, userDataName: string) {
	const _ref = getObjectUserDataRef(object3D, userDataName);
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}
