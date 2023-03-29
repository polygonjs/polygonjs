import {Object3D} from 'three';
import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from './CoreReactivity';

const refByObjectUuidByAttribName: Map<string, Map<string, Ref<number>>> = new Map();
export function _getObjectAttributeRef(object3D: Object3D, attribName: string) {
	let mapForObject = refByObjectUuidByAttribName.get(object3D.uuid);
	if (!mapForObject) {
		mapForObject = new Map();
		refByObjectUuidByAttribName.set(object3D.uuid, mapForObject);
	}
	let refForProperty = mapForObject.get(attribName);
	if (!refForProperty) {
		refForProperty = ref(0);
		mapForObject.set(attribName, refForProperty);
	}
	return refForProperty;
}
export function _dummyReadAttributeRefVal(value: number) {
	// we just need this method to force a call to .value
	// and ensure that we have a dependency with the ref()
}

export function touchObjectAttribute(object3D: Object3D, attribName: string) {
	const _ref = _getObjectAttributeRef(object3D, attribName);
	incrementRefSafely(_ref);
}
