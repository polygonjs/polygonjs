import {Vector2, Vector3, Vector4} from 'three';
import {NamedFunction} from '../../code/assemblers/_Base';

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
export function maxV3Component(src: Vector3, target: Vector3, value: number): void {
	target.x = Math.max(src.x, value);
	target.y = Math.max(src.y, value);
	target.z = Math.max(src.z, value);
}
//
//
// Sizzle
//
//
export const sizzleVec3XY: NamedFunction = {
	name: 'sizzleVec3XY',
	func: (src: Vector3, target: Vector2): void => {
		target.x = src.x;
		target.y = src.y;
	},
};
export const sizzleVec3XZ: NamedFunction = {
	name: 'sizzleVec3XZ',
	func: (src: Vector3, target: Vector2): void => {
		target.x = src.x;
		target.y = src.z;
	},
};
export const sizzleVec3YZ: NamedFunction = {
	name: 'sizzleVec3YZ',
	func: (src: Vector3, target: Vector2): void => {
		target.x = src.y;
		target.y = src.z;
	},
};
export const sizzleVec4XYZ: NamedFunction = {
	name: 'sizzleVec4XYZ',
	func: (src: Vector4, target: Vector3): void => {
		target.x = src.x;
		target.y = src.y;
		target.z = src.z;
	},
};

//
//
// Convert
//
//
export const vec2ToVec3: NamedFunction = {
	name: 'vec2ToVec3',
	func: (src: Vector2, z: number, target: Vector3): void => {
		target.x = src.x;
		target.y = src.y;
		target.z = z;
	},
};
export const vec3ToVec4: NamedFunction = {
	name: 'vec3ToVec4',
	func: (src: Vector3, w: number, target: Vector4): void => {
		target.x = src.x;
		target.y = src.y;
		target.z = src.z;
		target.w = w;
	},
};
