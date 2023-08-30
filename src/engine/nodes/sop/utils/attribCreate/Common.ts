import {Vector2, Vector3, Vector4} from 'three';
import type {BaseCoreObject} from '../../../../../core/geometry/_BaseObject';
import type {CoreObjectType} from '../../../../../core/geometry/ObjectContent';

export type ValueArrayByObject = WeakMap<BaseCoreObject<CoreObjectType>, number[]>;

export type VectorComponent = 'x' | 'y' | 'z' | 'w';
export const COMPONENT_NAMES: Array<VectorComponent> = ['x', 'y', 'z', 'w'];

export function initArrayIfRequired(
	coreObject: BaseCoreObject<CoreObjectType>,
	arraysByGeometryUuid: ValueArrayByObject,
	arrayLength: number
) {
	const currentArray = arraysByGeometryUuid.get(coreObject);
	if (currentArray) {
		// only create new array if we need more point, or as soon as the length is different?
		if (currentArray.length < arrayLength) {
			arraysByGeometryUuid.set(coreObject, new Array(arrayLength));
		}
	} else {
		arraysByGeometryUuid.set(coreObject, new Array(arrayLength));
	}
	return arraysByGeometryUuid.get(coreObject);
}

export function vectorByAttribSize(size: number) {
	switch (size) {
		case 2:
			return new Vector2(0, 0);
		case 3:
			return new Vector3(0, 0, 0);
		case 4:
			return new Vector4(0, 0, 0, 0);
	}
}
