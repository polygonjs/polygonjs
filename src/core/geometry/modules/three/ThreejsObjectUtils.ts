import {Object3D, Vector3, Euler, Quaternion, Matrix4} from 'three';
import {objectContentCopyProperties} from '../../ObjectContent';
export function copyObject3DProperties(srcObject: Object3D, destObject: Object3D) {
	objectContentCopyProperties(srcObject, destObject);
	destObject.position.copy(srcObject.position);
	destObject.quaternion.copy(srcObject.quaternion);
	destObject.scale.copy(srcObject.scale);
	destObject.matrix.copy(srcObject.matrix);
}

const UNCOPYABLE_PROPERTIES = new Set(['animations', 'children', 'layers', 'parent', 'userData']);
export function copyObjectAllProperties(srcObject: Object3D, destObject: Object3D) {
	const keys = Object.keys(destObject);
	for (const key of keys) {
		if (UNCOPYABLE_PROPERTIES.has(key)) {
			continue;
		}
		const destProperty = (destObject as any)[key];
		if (
			destProperty instanceof Vector3 ||
			destProperty instanceof Euler ||
			destProperty instanceof Quaternion ||
			destProperty instanceof Matrix4
		) {
			destProperty.copy((srcObject as any)[key] as any);
		} else {
			(destObject as any)[key] = (srcObject as any)[key];
		}
	}
	return destObject;
}
