import {Object3D, Vector3, Quaternion, Matrix4, Material} from 'three';
import {Ref} from '@vue/reactivity';
import {incrementRefSafely, ref} from '../../core/reactivity/CoreReactivity';

export enum GetObjectPropertyJsNodeInputName {
	position = 'position',
	quaternion = 'quaternion',
	scale = 'scale',
	matrix = 'matrix',
	visible = 'visible',
	castShadow = 'castShadow',
	receiveShadow = 'receiveShadow',
	frustumCulled = 'frustumCulled',
	// ptnum = 'ptnum',
	// id = 'id',
	// uuid = 'uuid',
	// name = 'name',
	// quaternion = 'quaternion',
	// rotation = 'rotation',
	up = 'up',
	matrixAutoUpdate = 'matrixAutoUpdate',
	material = 'material',
}
export const OBJECT_VECTOR3_PROPERTIES = [
	GetObjectPropertyJsNodeInputName.position,
	GetObjectPropertyJsNodeInputName.scale,
	GetObjectPropertyJsNodeInputName.up,
];
export const OBJECT_BOOLEAN_PROPERTIES = [
	GetObjectPropertyJsNodeInputName.visible,
	GetObjectPropertyJsNodeInputName.castShadow,
	GetObjectPropertyJsNodeInputName.receiveShadow,
	GetObjectPropertyJsNodeInputName.frustumCulled,
	GetObjectPropertyJsNodeInputName.matrixAutoUpdate,
];
export const OBJECT_TRANSFORM_PROPERTIES = [
	GetObjectPropertyJsNodeInputName.position,
	GetObjectPropertyJsNodeInputName.quaternion,
	GetObjectPropertyJsNodeInputName.scale,
	GetObjectPropertyJsNodeInputName.matrix,
];
export interface PropertyType {
	position: Vector3;
	quaternion: Quaternion;
	scale: Vector3;
	matrix: Matrix4;
	visible: boolean;
	castShadow: boolean;
	receiveShadow: boolean;
	frustumCulled: boolean;
	up: Vector3;
	matrixAutoUpdate: boolean;
	material: Material;
}

const refByObjectUuidByPropertyName: Map<string, Map<string, Ref<number>>> = new Map();
export function getObjectPropertyRef<K extends keyof PropertyType>(object3D: Object3D, propertyName: K) {
	let mapForObject = refByObjectUuidByPropertyName.get(object3D.uuid);
	if (!mapForObject) {
		mapForObject = new Map();
		refByObjectUuidByPropertyName.set(object3D.uuid, mapForObject);
	}
	let refForProperty = mapForObject.get(propertyName);
	if (!refForProperty) {
		refForProperty = ref(0);
		mapForObject.set(propertyName, refForProperty);
	}
	return refForProperty;
}

export function touchObjectProperties(object3D: Object3D, propertyNames: Array<keyof PropertyType>) {
	const map = refByObjectUuidByPropertyName.get(object3D.uuid);
	if (!map) {
		return;
	}
	for (let propertyName of propertyNames) {
		const _ref = map.get(propertyName);
		if (_ref) {
			incrementRefSafely(_ref);
		}
	}
}
export function touchObjectProperty<K extends keyof PropertyType>(object3D: Object3D, propertyName: K) {
	const _ref = getObjectPropertyRef(object3D, propertyName);
	incrementRefSafely(_ref);
}
