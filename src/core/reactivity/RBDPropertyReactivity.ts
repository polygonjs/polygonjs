import {Object3D} from 'three';
import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';
import {TimeController} from '../../engine/scene/utils/TimeController';

const refByRBDObjectUuidByPropertyName: Map<string, Map<string, Ref<number>>> = new Map();

export function getOrCreatePropertyRef(timeController: TimeController, object3D: Object3D, propertyName: string) {
	return getRBDPropertyRef(timeController, object3D, propertyName) || createRBDPropertyRef(object3D, propertyName);
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
function getRBDPropertyRef(timeController: TimeController, object3D: Object3D, propertyName: string) {
	return timeController.timeUniform();
	// return refByRBDObjectUuidByPropertyName.get(object3D.uuid)?.get(propertyName);
}

export function touchRBDProperties(object3D: Object3D, propertyNames: string[]) {
	const map = refByRBDObjectUuidByPropertyName.get(object3D.uuid);
	if (!map) {
		return;
	}
	for (const propertyName of propertyNames) {
		const _ref = map.get(propertyName);
		if (_ref) {
			incrementRefSafely(_ref);
		}
	}
}
export function touchRBDProperty(object3D: Object3D, propertyName: string) {
	// const _ref = getRBDPropertyRef(object3D, propertyName);
	// if (!_ref) {
	// 	return;
	// }
	// incrementRefSafely(_ref);
}
