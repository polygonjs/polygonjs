import {Color, Vector2, Vector3, Vector4} from 'three';
import {NamedFunction2, NamedFunction3, NamedFunction4} from './_Base';

//
//
//
//
//
export function _v2Function(src: Vector2, target: Vector2, _func: (x: number) => number): void {
	target.x = _func(src.x);
	target.y = _func(src.y);
}
export function _v3Function(src: Vector3, target: Vector3, _func: (x: number) => number): void {
	target.x = _func(src.x);
	target.y = _func(src.y);
	target.z = _func(src.z);
}
export function absV2(src: Vector2, target: Vector2): void {
	_v2Function(src, target, Math.abs);
}
export function absV3(src: Vector3, target: Vector3): void {
	_v3Function(src, target, Math.abs);
}
export function maxV3Components(src: Vector3): number {
	return Math.max(src.x, Math.max(src.y, src.z));
}
export function maxV3Component(src: Vector3, target: Vector3, value: number): Vector3 {
	target.x = Math.max(src.x, value);
	target.y = Math.max(src.y, value);
	target.z = Math.max(src.z, value);
	return target;
}
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

//
//
// Convert
//
//
export class floatToVec3 extends NamedFunction4<[number, number, number, Vector3]> {
	static override type() {
		return 'floatToVec3';
	}
	func(x: number, y: number, z: number, target: Vector3): Vector3 {
		target.x = x;
		target.y = y;
		target.z = z;
		return target;
	}
}
export class vec2ToVec3 extends NamedFunction3<[Vector2, number, Vector3]> {
	static override type() {
		return 'vec2ToVec3';
	}
	func(src: Vector2, z: number, target: Vector3): Vector3 {
		target.x = src.x;
		target.y = src.y;
		target.z = z;
		return target;
	}
}
export class vec3ToVec4 extends NamedFunction3<[Vector3, number, Vector4]> {
	static override type() {
		return 'vec3ToVec4';
	}
	func(src: Vector3, w: number, target: Vector4): Vector4 {
		target.x = src.x;
		target.y = src.y;
		target.z = src.z;
		target.w = w;
		return target;
	}
}
export class vec3ToColor extends NamedFunction2<[Vector3, Color]> {
	static override type() {
		return 'vec3ToColor';
	}
	func(src: Vector3, target: Color): Color {
		target.r = src.x;
		target.g = src.y;
		target.b = src.z;
		return target;
	}
}
export class colorToVec3 extends NamedFunction2<[Color, Vector3]> {
	static override type() {
		return 'colorToVec3';
	}
	func(src: Color, target: Vector3): Vector3 {
		target.x = src.r;
		target.y = src.g;
		target.z = src.b;
		return target;
	}
}
