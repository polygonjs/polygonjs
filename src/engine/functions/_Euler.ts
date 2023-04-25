import {Euler, EulerOrder, Vector3, Quaternion} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';

export class eulerSetFromVector3 extends NamedFunction3<[Vector3, EulerOrder, Euler]> {
	static override type() {
		return 'eulerSetFromVector3';
	}
	func(values: Vector3, order: EulerOrder, target: Euler): Euler {
		target.setFromVector3(values);
		target.order = order;
		return target;
	}
}
export class eulerSetFromQuaternion extends NamedFunction2<[Quaternion, Euler]> {
	static override type() {
		return 'eulerSetFromQuaternion';
	}
	func(values: Quaternion, target: Euler): Euler {
		target.setFromQuaternion(values);
		return target;
	}
}
