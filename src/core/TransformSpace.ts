import {Matrix4, Object3D} from 'three';
import {TypeAssert} from '../engine/poly/Assert';

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
	object: Object3D,
	matrix: Matrix4,
	transformSpace: ObjectTransformSpace
) {
	switch (transformSpace) {
		case ObjectTransformSpace.PARENT: {
			object.updateMatrix();
			object.applyMatrix4(matrix);
			object.matrix.decompose(object.position, object.quaternion, object.scale);
			return;
		}
		case ObjectTransformSpace.LOCAL: {
			object.updateMatrix();
			object.matrix.multiply(matrix);
			object.matrix.decompose(object.position, object.quaternion, object.scale);
			return;
		}
	}
	TypeAssert.unreachable(transformSpace);
}
