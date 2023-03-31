import {Vector2, Vector3} from 'three';

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
