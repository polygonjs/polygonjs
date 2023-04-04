import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction2} from './_Base';

export class normalizeVector2 extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'normalizeVector2';
	}
	func(src: Vector2, target: Vector2): Vector2 {
		return target.copy(src).normalize();
	}
}
export class normalizeVector3 extends NamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'normalizeVector3';
	}
	func(src: Vector3, target: Vector3): Vector3 {
		return target.copy(src).normalize();
	}
}
export class normalizeVector4 extends NamedFunction2<[Vector4, Vector4]> {
	static override type() {
		return 'normalizeVector4';
	}
	func(src: Vector4, target: Vector4): Vector4 {
		return target.copy(src).normalize();
	}
}
