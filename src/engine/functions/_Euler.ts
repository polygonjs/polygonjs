import {Euler, EulerOrder, Vector3, Quaternion} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';
import {ROTATION_ORDERS} from '../../core/Transform';

export class eulerSetFromVector3 extends NamedFunction3<[Vector3, number | EulerOrder, Euler]> {
	static override type() {
		return 'eulerSetFromVector3';
	}
	func(values: Vector3, orderIndex: number | EulerOrder, target: Euler): Euler {
		const order = typeof orderIndex == 'number' ? ROTATION_ORDERS[orderIndex] : orderIndex;
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
