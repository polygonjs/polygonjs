import {Euler, Vector3, Quaternion} from 'three';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';

export class quaternionSetFromEuler extends NamedFunction2<[Euler, Quaternion]> {
	static override type() {
		return 'quaternionSetFromEuler';
	}
	func(euler: Euler, target: Quaternion): Quaternion {
		target.setFromEuler(euler);
		return target;
	}
}
export class quaternionSetFromAxisAngle extends NamedFunction3<[Vector3, number, Quaternion]> {
	static override type() {
		return 'quaternionSetFromAxisAngle';
	}
	func(axis: Vector3, angle: number, target: Quaternion): Quaternion {
		target.setFromAxisAngle(axis, angle);
		return target;
	}
}
export class quaternionAngleTo extends NamedFunction2<[Quaternion, Quaternion]> {
	static override type() {
		return 'quaternionAngleTo';
	}
	func(src: Quaternion, to: Quaternion): number {
		return src.angleTo(to);
	}
}
export class quaternionSlerp extends NamedFunction4<[Quaternion, Quaternion, number, Quaternion]> {
	static override type() {
		return 'quaternionSlerp';
	}
	func(q1: Quaternion, q2: Quaternion, lerp: number, target: Quaternion): Quaternion {
		target.copy(q1).slerp(q2, lerp);
		return target;
	}
}
