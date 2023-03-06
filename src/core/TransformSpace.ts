import {Matrix4} from 'three';
import {TypeAssert} from '../engine/poly/Assert';
import {CoreObjectType, isObject3D, ObjectContent} from './geometry/ObjectContent';

export enum ObjectTransformSpace {
	PARENT = 'parent',
	LOCAL = 'local',
}
export const OBJECT_TRANSFORM_SPACES: ObjectTransformSpace[] = [
	ObjectTransformSpace.PARENT,
	ObjectTransformSpace.LOCAL,
];
export const OBJECT_TRANSFORM_SPACE_MENU_ENTRIES = [
	{name: 'parent', value: OBJECT_TRANSFORM_SPACES.indexOf(ObjectTransformSpace.PARENT)},
	{name: 'local', value: OBJECT_TRANSFORM_SPACES.indexOf(ObjectTransformSpace.LOCAL)},
];

export function applyTransformWithSpaceToObject(
	object: ObjectContent<CoreObjectType>,
	matrix: Matrix4,
	transformSpace: ObjectTransformSpace
) {
	switch (transformSpace) {
		case ObjectTransformSpace.PARENT: {
			if (isObject3D(object)) {
				object.updateMatrix();
				object.applyMatrix4(matrix);
				object.matrix.decompose(object.position, object.quaternion, object.scale);
			} else {
				object.applyMatrix4(matrix);
			}
			return;
		}
		case ObjectTransformSpace.LOCAL: {
			if (isObject3D(object)) {
				object.updateMatrix();
				object.matrix.multiply(matrix);
				object.matrix.decompose(object.position, object.quaternion, object.scale);
			} else {
				// it should ideally multiply the existing matrix,
				// but I'm not sure how to do that with cad objects for now
				object.applyMatrix4(matrix);
			}
			return;
		}
	}
	TypeAssert.unreachable(transformSpace);
}
