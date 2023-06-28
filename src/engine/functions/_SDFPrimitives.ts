import {Vector3} from 'three';
import {NamedFunction3, NamedFunction4} from './_Base';
import {absV3, maxV3Components, maxV3Component} from './_VectorUtils';

const _q = new Vector3();
const _sHalf = new Vector3();

//
//
// SDF PRIMITIVES
//
//
export function _SDFBox(p: Vector3, center: Vector3, sizes: Vector3, size: number): number {
	_sHalf.copy(sizes).multiplyScalar(size * 0.5);
	absV3(p.sub(center), _q);
	_q.sub(_sHalf);

	const max = Math.min(0, maxV3Components(_q));
	maxV3Component(_q, _q, 0);
	const length = _q.length();

	return length + max;
}
export class SDFBox extends NamedFunction4<[Vector3, Vector3, Vector3, number]> {
	static override type() {
		return 'SDFBox';
	}
	func = _SDFBox;
}
export function _SDFPlane(p: Vector3, center: Vector3, normal: Vector3, offset: number): number {
	// n must be normalized
	_q.copy(normal).normalize();
	return p.sub(center).dot(_q) + offset;
}
export class SDFPlane extends NamedFunction4<[Vector3, Vector3, Vector3, number]> {
	static override type() {
		return 'SDFPlane';
	}
	func = _SDFPlane;
}

export function _SDFSphere(p: Vector3, center: Vector3, s: number): number {
	return p.sub(center).length() - s;
}
export class SDFSphere extends NamedFunction3<[Vector3, Vector3, number]> {
	static override type() {
		return 'SDFSphere';
	}
	func = _SDFSphere;
}
