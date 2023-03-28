import {Mesh, Object3D, Vector3, Quaternion, Matrix4, Material} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {Ref} from '@vue/reactivity';
import {ref} from '../../core/reactivity';

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
interface PropertyType {
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

const refByObjectUuidByPropertyName: Map<string, Map<string, Ref>> = new Map();
function _getRef<K extends keyof PropertyType>(object3D: Object3D, propertyName: K) {
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
function _dummy(value: number) {
	// we just need this method to force a call to .value
	// and ensure that we have a dependency with the ref()
}

export class getObjectProperty extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectProperty';
	}
	func<K extends keyof PropertyType>(object3D: Object3D, propertyName: K): PropertyType[K] {
		const _ref = _getRef(object3D, propertyName);
		_dummy(_ref.value);
		return (object3D as Mesh)[propertyName] as PropertyType[K];
	}
}

export function touchObjectProperty<K extends keyof PropertyType>(object3D: Object3D, propertyName: K) {
	const _ref = _getRef(object3D, propertyName);
	_ref.value += 1;
}
