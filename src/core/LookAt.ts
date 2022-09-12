import type {Object3D} from 'three';
import {Vector3} from 'three';

const t = new Vector3();

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
