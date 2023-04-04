import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction3} from './_Base';

export class maxLengthVector2 extends NamedFunction3<[Vector2, number, Vector2]> {
	static override type() {
		return 'maxLengthVector2';
	}
	func(src: Vector2, maxLength: number, target: Vector2): Vector2 {
		target.copy(src);
		const length = target.length();
		if (length > maxLength) {
			target.normalize().multiplyScalar(maxLength);
		}
		return target;
	}
}

export class maxLengthVector3 extends NamedFunction3<[Vector3, number, Vector3]> {
	static override type() {
		return 'maxLengthVector3';
	}
	func(src: Vector3, maxLength: number, target: Vector3): Vector3 {
		target.copy(src);
		const length = target.length();
		if (length > maxLength) {
			target.normalize().multiplyScalar(maxLength);
		}
		return target;
	}
}
export class maxLengthVector4 extends NamedFunction3<[Vector4, number, Vector4]> {
	static override type() {
		return 'maxLengthVector4';
	}
	func(src: Vector4, maxLength: number, target: Vector4): Vector4 {
		target.copy(src);
		const length = target.length();
		if (length > maxLength) {
			target.normalize().multiplyScalar(maxLength);
		}
		return target;
	}
}
