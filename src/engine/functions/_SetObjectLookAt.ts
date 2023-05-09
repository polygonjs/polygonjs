import {Object3D, Quaternion, Vector3} from 'three';
import {CoreLookAt} from '../../core/LookAt';
import {isBooleanTrue} from '../../core/Type';
import {touchObjectProperty, GetObjectPropertyJsNodeInputName} from '../../core/reactivity/ObjectPropertyReactivity';
import {ObjectNamedFunction5} from './_Base';

const q1 = new Quaternion();
const q2 = new Quaternion();
export class setObjectLookAt extends ObjectNamedFunction5<[Vector3, Vector3, number, boolean, boolean]> {
	static override type() {
		return 'setObjectLookAt';
	}
	func(
		object3D: Object3D,
		targetPosition: Vector3,
		up: Vector3,
		lerp: number,
		invertDirection: boolean,
		updateMatrix: boolean
	): void {
		object3D.up.copy(up);

		if (lerp >= 1) {
			CoreLookAt.applyLookAt(object3D, targetPosition, invertDirection);
		} else {
			q1.copy(object3D.quaternion);
			CoreLookAt.applyLookAt(object3D, targetPosition, invertDirection);
			q2.copy(object3D.quaternion);
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
