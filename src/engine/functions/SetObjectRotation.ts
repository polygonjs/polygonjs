import {Object3D, Vector3, Euler, Quaternion} from 'three';
import {touchObjectProperty, GetObjectPropertyJsNodeInputName} from '../../core/reactivity/ObjectPropertyReactivity';
import {ObjectNamedFunction4} from './_Base';
import {ROTATION_ORDERS} from '../../core/Transform';
import {isBooleanTrue} from '../../core/Type';

const tmpEuler = new Euler();
const q1 = new Quaternion();
const q2 = new Quaternion();
export class setObjectRotation extends ObjectNamedFunction4<[Vector3, number, number, boolean]> {
	static override type() {
		return 'setObjectRotation';
	}
	func(object3D: Object3D, rotation: Vector3, rotationOrder: number, lerp: number, updateMatrix: boolean): void {
		tmpEuler.order = ROTATION_ORDERS[rotationOrder];
		tmpEuler.set(rotation.x, rotation.y, rotation.z);

		if (lerp >= 1) {
			object3D.quaternion.setFromEuler(tmpEuler, false);
		} else {
			q1.copy(object3D.quaternion);
			q2.setFromEuler(tmpEuler, false);
			q1.slerp(q2, lerp);
			object3D.quaternion.copy(q1);
		}
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.quaternion);
		if (isBooleanTrue(updateMatrix)) {
			object3D.updateMatrix();
			touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.matrix);
		}
	}
}
