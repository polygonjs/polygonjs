import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction2} from './_Base';

//
//
// Sizzle
//
//
export function _sizzleVec3XY(src: Vector3, target: Vector2): Vector2 {
	target.x = src.x;
	target.y = src.y;
	return target;
}
export class sizzleVec3XY extends NamedFunction2<[Vector3, Vector2]> {
	static override type() {
		return 'sizzleVec3XY';
	}
	func = _sizzleVec3XY;
}
export function _sizzleVec3XZ(src: Vector3, target: Vector2): Vector2 {
	target.x = src.x;
	target.y = src.z;
	return target;
}
export class sizzleVec3XZ extends NamedFunction2<[Vector3, Vector2]> {
	static override type() {
		return 'sizzleVec3XZ';
	}
	func = _sizzleVec3XZ;
}
export function _sizzleVec3YZ(src: Vector3, target: Vector2): Vector2 {
	target.x = src.y;
	target.y = src.z;
	return target;
}
export class sizzleVec3YZ extends NamedFunction2<[Vector3, Vector2]> {
	static override type() {
		return 'sizzleVec3YZ';
	}
	func = _sizzleVec3YZ;
}
export class sizzleVec4XYZ extends NamedFunction2<[Vector4, Vector3]> {
	static override type() {
		return 'sizzleVec4XYZ';
	}
	func(src: Vector4, target: Vector3): Vector3 {
		target.x = src.x;
		target.y = src.y;
		target.z = src.z;
		return target;
	}
}
