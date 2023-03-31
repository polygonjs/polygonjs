import {Object3D} from 'three';
import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';

const refByRBDObjectUuidByPropertyName: Map<string, Map<string, Ref<number>>> = new Map();

export function getOrCreatePropertyRef(object3D: Object3D, propertyName: string) {
	return getRBDPropertyRef(object3D, propertyName) || createRBDPropertyRef(object3D, propertyName);
}
function createRBDPropertyRef(object3D: Object3D, propertyName: string) {
	let mapForObject = refByRBDObjectUuidByPropertyName.get(object3D.uuid);
	if (!mapForObject) {
		mapForObject = new Map();
		refByRBDObjectUuidByPropertyName.set(object3D.uuid, mapForObject);
	}
	let refForProperty = mapForObject.get(propertyName);
	if (!refForProperty) {
		refForProperty = ref(0);
		mapForObject.set(propertyName, refForProperty);
	}
	return refForProperty;
}
function getRBDPropertyRef(object3D: Object3D, propertyName: string) {
	return refByRBDObjectUuidByPropertyName.get(object3D.uuid)?.get(propertyName);
}
export function _dummyReadPropertyRefVal(value: number) {
	// we just need this method to force a call to .value
	// and ensure that we have a dependency with the ref()
}

export function touchRBDProperty(object3D: Object3D, propertyName: string) {
	const _ref = getRBDPropertyRef(object3D, propertyName);
	if (!_ref) {
		return;
	}
	incrementRefSafely(_ref);
}
