import {Matrix4, Vector3} from 'three';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';

export class matrix4LookAt extends NamedFunction4<[Vector3, Vector3, Vector3, Matrix4]> {
	static override type() {
		return 'matrix4LookAt';
	}
	func(eye: Vector3, lookAtTarget: Vector3, up: Vector3, target: Matrix4): Matrix4 {
		target.lookAt(eye, lookAtTarget, up);
		return target;
	}
}

export class matrix4MakeTranslation extends NamedFunction2<[Vector3, Matrix4]> {
	static override type() {
		return 'matrix4MakeTranslation';
	}
	func(t: Vector3, target: Matrix4): Matrix4 {
		target.makeTranslation(t.x, t.y, t.z);
		return target;
	}
}
export class matrix4Multiply extends NamedFunction3<[Matrix4, Matrix4, Matrix4]> {
	static override type() {
		return 'matrix4Multiply';
	}
	func(m1: Matrix4, m2: Matrix4, target: Matrix4): Matrix4 {
		target.copy(m1).multiply(m2);
		return target;
	}
}
