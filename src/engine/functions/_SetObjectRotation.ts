import {Object3D, Euler, Quaternion} from 'three';
import {touchObjectProperty, GetObjectPropertyJsNodeInputName} from '../../core/reactivity/ObjectPropertyReactivity';
import {ObjectNamedFunction3} from './_Base';
import {isBooleanTrue} from '../../core/Type';

const q1 = new Quaternion();
const q2 = new Quaternion();
export class setObjectRotation extends ObjectNamedFunction3<[Euler, number, boolean]> {
	static override type() {
		return 'setObjectRotation';
	}
	func(object3D: Object3D, euler: Euler, lerp: number, updateMatrix: boolean): void {
		if (lerp >= 1) {
			object3D.quaternion.setFromEuler(euler, true);
		} else {
			q1.copy(object3D.quaternion);
			q2.setFromEuler(euler, true);
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
