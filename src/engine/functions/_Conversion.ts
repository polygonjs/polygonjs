import {Color, Vector2, Vector3, Vector4} from 'three';
import {NamedFunction1, NamedFunction2, NamedFunction3, NamedFunction4, NamedFunction5} from './_Base';

//
//
// Int <-> Bool
//
//
export class boolToInt extends NamedFunction1<[boolean]> {
	static override type() {
		return 'boolToInt';
	}
	func(b: boolean): number {
		return b ? 1 : 0;
	}
}
export class intToBool extends NamedFunction1<[number]> {
	static override type() {
		return 'intToBool';
	}
	func(v: number): boolean {
		return Boolean(v);
	}
}
//
//
// Int -> Float
//
//
export class floatToInt extends NamedFunction1<[number]> {
	static override type() {
		return 'floatToInt';
	}
	func(v: number): number {
		return Math.round(v);
	}
}
export class intToFloat extends NamedFunction1<[number]> {
	static override type() {
		return 'intToFloat';
	}
	func(v: number): number {
		return v;
	}
}

//
//
// Float -> X
//
//
export class floatToColor extends NamedFunction4<[number, number, number, Color]> {
	static override type() {
		return 'floatToColor';
	}
	func(r: number, g: number, b: number, target: Color): Color {
		target.r = r;
		target.g = g;
		target.b = b;
		return target;
	}
}
export class floatToVec2 extends NamedFunction3<[number, number, Vector2]> {
	static override type() {
		return 'floatToVec2';
	}
	func(x: number, y: number, target: Vector2): Vector2 {
		target.x = x;
		target.y = y;
		return target;
	}
}
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
export class floatToVec4 extends NamedFunction5<[number, number, number, number, Vector4]> {
	static override type() {
		return 'floatToVec4';
	}
	func(x: number, y: number, z: number, w: number, target: Vector4): Vector4 {
		target.x = x;
		target.y = y;
		target.z = z;
		target.w = w;
		return target;
	}
}

//
//
// VecX <-> VecX
//
//
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
//
//
// Color <-> Vec3
//
//
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
export class Vec3ToColor extends NamedFunction2<[Vector3, Color]> {
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
