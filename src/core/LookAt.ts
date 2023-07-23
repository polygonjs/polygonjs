import type {Object3D} from 'three';
import {Vector3, Matrix4, Quaternion} from 'three';

const t = new Vector3();
const _m4 = new Matrix4();
export function quatLookAt(position: Vector3, targetPosition: Vector3, up: Vector3, target: Quaternion) {
	_m4.lookAt(targetPosition, position, up);
	target.setFromRotationMatrix(_m4);
}

export class CoreLookAt {
	static applyLookAt(object: Object3D, target: Vector3, invert: boolean) {
		if (invert) {
			t.copy(object.position);
			object.position.copy(target);
			object.updateMatrix();
			object.lookAt(t);
			object.position.copy(t);
			object.updateMatrix();
		} else {
			object.lookAt(target);
		}
	}
}
